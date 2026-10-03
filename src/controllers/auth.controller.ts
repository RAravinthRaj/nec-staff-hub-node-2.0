/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import logger from '../utils/logger';

export class AuthController {
  static async sendOTP(req: Request, res: Response) {
    try {
      const { email } = req.body;
      logger.info(`[sendOTP] Request received for email: ${email || 'EMPTY'}`);

      if (!email) {
        logger.warn('[sendOTP] Email parameter missing');
        return res.status(400).json({ message: 'Email is required' });
      }

      const result = await AuthService.sendOTP(email);
      logger.info(`[sendOTP] Success for email: ${email}`);

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error(`[sendOTP] Error for email: ${req.body?.email}: ${error.message || error}`);
      return res.status(400).json({ message: error.message || 'Failed to send OTP' });
    }
  }

  static async googleLogin(req: Request, res: Response) {
    try {
      const { googleToken, idToken, email } = req.body;
      logger.info(`[googleLogin] Request received for email/token: ${email || 'ID_TOKEN'}`);

      if (!googleToken && !idToken && !email) {
        logger.warn('[googleLogin] Google token or email missing');
        return res.status(400).json({ message: 'Google token or email is required' });
      }

      const result = await AuthService.googleLogin({ googleToken, idToken, email });
      logger.info(`[googleLogin] Success for email: ${result.user?.email}`);

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error(`[googleLogin] Error: ${error.message || error}`);
      return res.status(401).json({
        message: error.message || 'Google login failed',
      });
    }
  }

  static async verifyOTP(req: Request, res: Response) {
    try {
      const { email, otp } = req.body;
      logger.info(`[verifyOTP] Request received for email: ${email || 'EMPTY'}`);

      if (!email || !otp) {
        logger.warn('[verifyOTP] Email or OTP missing');
        return res.status(400).json({ message: 'Email and OTP are required' });
      }

      const result = await AuthService.verifyOTP(email, otp);
      logger.info(`[verifyOTP] Success for email: ${email}`);

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error(`[verifyOTP] Error for email ${req.body?.email}: ${error.message || error}`);
      return res.status(400).json({ message: error.message || 'OTP verification failed' });
    }
  }
}
