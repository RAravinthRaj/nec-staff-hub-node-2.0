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
import { NotificationController } from '../controllers/notification.controller';
import { authenticateJWT } from '../middlewares/authenticateJwt.middleware';

const router = Router();

// Health Check Endpoint for Cloud Deployments
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

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

// Notifications Module
router.get('/notifications', authenticateJWT, NotificationController.getNotifications);
router.put('/notifications/:id/read', authenticateJWT, NotificationController.markAsRead);
router.post('/trigger-cron-test', authenticateJWT, NotificationController.triggerCronTest);

export default router;
