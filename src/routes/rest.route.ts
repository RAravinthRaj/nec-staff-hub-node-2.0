/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/send-otp', AuthController.sendOTP);
router.post('/google-login', AuthController.googleLogin);
router.post('/verify-otp', AuthController.verifyOTP);

export default router;
