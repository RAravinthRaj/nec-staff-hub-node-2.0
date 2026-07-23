/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
  static async sendOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const result = await AuthService.sendOTP(email);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'Failed to send OTP' });
    }
  }

  static async googleLogin(req: Request, res: Response) {
    try {
      const { googleToken, idToken, email } = req.body;

      if (!googleToken && !idToken && !email) {
        return res.status(400).json({ message: 'Google token or email is required' });
      }

      const result = await AuthService.googleLogin({ googleToken, idToken, email });

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(401).json({
        message: error.message || 'Google login failed',
      });
    }
  }

  static async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ message: 'Email and OTP are required' });
      }

      const result = await AuthService.verifyOTP(email, otp);

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message || 'OTP verification failed' });
    }
  }
}
