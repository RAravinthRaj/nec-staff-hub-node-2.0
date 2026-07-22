/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import jwt from 'jsonwebtoken';
import { config } from '../config/config';

export class JwtService {
  private static instance: JwtService;

  private constructor() {}

  public static getInstance(): JwtService {
    if (!JwtService.instance) {
      JwtService.instance = new JwtService();
    }

    return JwtService.instance;
  }

  public generateToken(payload: object): string {
    const expiresIn = config.jwtExpiryTime;
    return jwt.sign(payload, config.jwtSecretKey, {
      expiresIn,
    });
  }

  public verifyToken(token: string): any {
    return jwt.verify(token, config.jwtSecretKey);
  }
}
