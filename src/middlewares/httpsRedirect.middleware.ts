/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';

export const httpsRedirect = (req: Request, res: Response, next: NextFunction) => {
  if (config.nodeEnv === 'development') {
    return next();
  }

  const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
  if (!isSecure) {
    const redirectURL = `https://${req.headers.host}${req.url}`;
    return res.redirect(301, redirectURL);
  }

  next();
};
