/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';

export const bodySizeLimit = (req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(config.rateLimitMinutes * 1000);
  next();
};
