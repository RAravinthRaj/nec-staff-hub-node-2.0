/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { Request, Response, NextFunction } from 'express';
import { config } from '../config/config';

export const bodySizeLimit = (req: Request, res: Response, next: NextFunction) => {
  // Set socket request timeout to 2 minutes (120,000 ms)
  req.setTimeout(120 * 1000);
  next();
};
