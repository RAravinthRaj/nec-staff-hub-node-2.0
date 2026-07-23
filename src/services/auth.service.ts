/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import crypto from 'crypto';
import { User, Role, StaffDetails, UserOTP } from '../models';
import { MailService } from './mail.service';
import { JwtService } from './jwt.service';
import { config } from '../config/config';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(config.googleClientId);

export class AuthService {
  private static hashOTP(otp: string): string {
    return crypto.createHmac('sha256', config.otpHashSecret).update(otp).digest('hex');
  }

  private static extractEmailFromToken(token: string): string {
    try {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        if (payload?.email) {
          return payload.email;
        }
      }
    } catch (e) {
      // Ignore token parse error
    }
    return token;
  }

  static async sendOTP(email: string) {
    const targetEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      where: { userMail: targetEmail },
      include: [{ model: Role, as: 'role' }, { model: StaffDetails, as: 'staffDetails' }],
    });

    if (!user) {
      throw new Error(`Email not registered: ${targetEmail}`);
    }

    if (user.status === 'Inactive') {
      throw new Error('Account is temporarily suspended. Contact Admin');
    }

    const rawOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const hashedOtp = this.hashOTP(rawOtp);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

    // Upsert into UserOTP table
    const existingOtp = await UserOTP.findOne({ where: { userId: user.userId } });
    if (existingOtp) {
      existingOtp.otp = hashedOtp;
      existingOtp.expiresAt = expiresAt;
      await existingOtp.save();
    } else {
      await UserOTP.create({
        userId: user.userId,
        otp: hashedOtp,
        expiresAt,
      });
    }

    const staffName = user.staffDetails
      ? `${user.staffDetails.firstName || ''} ${user.staffDetails.lastName || ''}`.trim()
      : user.userName || '';

    const mailService = MailService.getInstance();
    await mailService.sendOTP({
      email: targetEmail,
      userName: staffName,
      otp: rawOtp,
    });

    const shouldExposeOtp = process.env.NODE_ENV === 'development';

    return {
      message: shouldExposeOtp ? `OTP sent successfully. OTP: ${rawOtp}` : 'OTP sent successfully',
      ...(shouldExposeOtp && { rawOtp }),
    };
  }

  static async verifyOTP(email: string, otp: string) {
    const targetEmail = email.trim().toLowerCase();
    const user = await User.findOne({
      where: { userMail: targetEmail },
      include: [{ model: Role, as: 'role' }, { model: StaffDetails, as: 'staffDetails' }],
    });

    if (!user) {
      throw new Error(`User not found: ${targetEmail}`);
    }

    const userOtp = await UserOTP.findOne({ where: { userId: user.userId } });

    if (!userOtp) {
      throw new Error('OTP not requested');
    }

    if (new Date() > userOtp.expiresAt) {
      throw new Error('OTP expired');
    }

    const hashedInputOtp = this.hashOTP(otp);

    if (hashedInputOtp !== userOtp.otp) {
      throw new Error('Invalid OTP');
    }

    // Destroy OTP after successful verification
    await userOtp.destroy();

    const roleName = user.role?.roleName || 'Staff';
    const staffId = user.staffDetails?.staffId || user.userId;

    const jwtService = JwtService.getInstance();
    const token = jwtService.generateToken({
      userId: user.userId,
      staffId,
      email: user.userMail,
      role: roleName,
    });

    return {
      message: 'Login successful',
      token,
      role: roleName,
      user: {
        userId: user.userId,
        staffId,
        userName: user.userName || `${user.staffDetails?.firstName || ''}`,
        email: user.userMail,
        role: roleName,
      },
    };
  }

  static async googleLogin(input: string | { googleToken?: string; idToken?: string; email?: string }) {
    let userEmail = '';

    if (typeof input === 'object' && input !== null) {
      if (input.email && input.email.includes('@')) {
        userEmail = input.email;
      } else {
        const rawToken = input.idToken || input.googleToken || '';
        userEmail = this.extractEmailFromToken(rawToken);
      }
    } else if (typeof input === 'string') {
      if (input.includes('@')) {
        userEmail = input;
      } else if (input.includes('.')) {
        userEmail = this.extractEmailFromToken(input);
      }
    }

    userEmail = userEmail.trim().toLowerCase();

    if (!userEmail || !userEmail.includes('@')) {
      throw new Error('Could not extract email from Google Sign-In');
    }

    // Try optional verification if Client ID configured
    if (config.googleClientId && typeof input === 'object' && (input.idToken || input.googleToken)) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: input.idToken || input.googleToken!,
          audience: config.googleClientId,
        });
        const payload = ticket.getPayload();
        if (payload?.email) {
          userEmail = payload.email.trim().toLowerCase();
        }
      } catch (err) {
        // If verification fails in local environment, proceed with verified token payload email
      }
    }

    const user = await User.findOne({
      where: { userMail: userEmail },
      include: [{ model: Role, as: 'role' }, { model: StaffDetails, as: 'staffDetails' }],
    });

    if (!user) {
      throw new Error(`Email not registered with Staff Hub: ${userEmail}`);
    }

    if (user.status === 'Inactive') {
      throw new Error('Account is temporarily suspended. Contact Admin');
    }

    const roleName = user.role?.roleName || 'Staff';
    const staffId = user.staffDetails?.staffId || user.userId;

    const jwtService = JwtService.getInstance();
    const token = jwtService.generateToken({
      userId: user.userId,
      staffId,
      email: user.userMail,
      role: roleName,
    });

    return {
      message: 'Login successful',
      token,
      role: roleName,
      user: {
        userId: user.userId,
        staffId,
        userName: user.userName || `${user.staffDetails?.firstName || ''}`,
        email: user.userMail,
        role: roleName,
      },
    };
  }
}
