/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025
*/

import crypto from 'crypto';
import { User, Role, Staff } from '../models';
import { MailService } from '../services/mail.service';
import { JwtService } from '../services/jwt.service';
import { config } from '../config/config';
import { OAuth2Client } from 'google-auth-library';
import { UserStatus } from '../config/enum.config';

const googleClient = new OAuth2Client(config.googleClientId);
export class AuthService {
  private static hashOTP(otp: string): string {
    return crypto.createHmac('sha256', config.otpHashSecret).update(otp).digest('hex');
  }

  static async sendOTP(email: string) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error('Email not registered');
    }

    if (user?.status === UserStatus.Inactive) {
      throw new Error('Account is temporarily Suspended. Contact Admin');
    }

    const rawOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const hashedOtp = this.hashOTP(rawOtp);

    user.otp = hashedOtp;
    user.otp_expiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const staff = await Staff.findOne({ where: { email } });

    const mailService = MailService.getInstance();
    await mailService.sendOTP({
      email,
      userName: staff?.name || '',
      otp: rawOtp,
    });

    const shouldExposeOtp = process.env.NODE_ENV === 'development';

    return {
      message: shouldExposeOtp ? `OTP sent successfully. OTP: ${rawOtp}` : 'OTP sent successfully',
      ...(shouldExposeOtp && { rawOtp }),
    };
  }

  static async googleLogin(userEmail: string) {
    const user = await User.findOne({
      where: { email: userEmail },
      include: ['roles'],
    });

    if (!user) {
      throw new Error('Email not registered');
    }

    if (user?.status === UserStatus.Inactive) {
      throw new Error('Account is temporarily Suspended. Contact Admin');
    }

    const staff = await Staff.findOne({
      where: { email: userEmail },
    });

    if (!staff) {
      throw new Error('Staff not found');
    }

    const jwtService = JwtService.getInstance();

    const token = jwtService.generateToken({
      id: staff.id,
      role: user.roles?.[0]?.name,
    });

    return {
      message: 'Login successful',
      token,
      role: user.roles?.[0]?.name,
    };
  }

  static async verifyOTP(email: string, otp: string) {
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'roles' }],
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.otp || !user.otp_expiry) {
      throw new Error('OTP not requested');
    }

    if (new Date() > user.otp_expiry) {
      throw new Error('OTP expired');
    }

    const hashedInputOtp = this.hashOTP(otp);

    if (hashedInputOtp !== user.otp) {
      throw new Error('Invalid OTP');
    }

    user.otp = null;
    user.otp_expiry = null;
    await user.save();

    const staff = await Staff.findOne({ where: { email } });

    if (!staff) throw new Error('Staff not found');

    const jwtService = JwtService.getInstance();
    const token = jwtService.generateToken({
      id: staff.id,
      role: user.roles?.[0]?.name,
    });

    return {
      message: 'Login successful',
      token,
      role: user.roles?.[0]?.name,
    };
  }
}
