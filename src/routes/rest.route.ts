/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { TimetableController } from '../controllers/timetable.controller';
import { AttendanceController } from '../controllers/attendance.controller';
import { authenticateJWT } from '../middlewares/authenticateJwt.middleware';

const router = Router();

router.post('/send-otp', AuthController.sendOTP);
router.post('/google-login', AuthController.googleLogin);
router.post('/verify-otp', AuthController.verifyOTP);

// Timetable & Attendance Student List
router.get('/timetable', authenticateJWT, TimetableController.getTimetable);
router.get('/students-for-attendance', authenticateJWT, TimetableController.getStudentsForAttendance);

// Attendance Entry & Copy Features
router.post('/submit-attendance', authenticateJWT, AttendanceController.submitAttendance);
router.get('/copy-attendance', authenticateJWT, AttendanceController.copyAttendance);
router.get('/filter-attendance-records', authenticateJWT, AttendanceController.filterAttendanceRecords);

export default router;
