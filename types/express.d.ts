/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { AuthenticatedJwtPayload } from '@/middlewares/authenticateJwt.middleware';
import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedJwtPayload;
    }
  }
}

export type CustomRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<any>;

export {};
