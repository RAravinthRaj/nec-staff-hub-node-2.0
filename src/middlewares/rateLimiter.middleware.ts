/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { config } from '../config/config';

export const rate_limiter = rateLimit({
  windowMs: config.rateLimitMinutes * 60 * 1000,
  max: config.rateLimitRequests,

  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req: any) => {
    return req.user?.id || ipKeyGenerator(req);
  },

  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests',
    });
  },
});
