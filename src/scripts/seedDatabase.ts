import { sequelize } from '../config/database';

async function seed() {
  console.log('🌱 Starting Database Seeding...');

  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');

    // 1. Roles table
    console.log('1. Ensuring roles...');
    await sequelize.query(`
      UPDATE roles SET roleName = 'Department Admin' WHERE roleId = 2;
    `);
    await sequelize.query(`
      UPDATE roles SET roleName = 'Staff' WHERE roleId = 5;
    `);

    // 2. Upsert users (aravinthr239@gmail.com, sks-cse@nec.edu.in, hod@mailsac.com)
    console.log('2. Upserting users...');
    const defaultPasswordHash = '$2a$10$j8KpX9PgnH73gqXzA9YPF.MOI5K8j/kHLGEskbjlwaTa57yEAVsMi';

    // aravinthr239@gmail.com (userId: 8888)
    await sequelize.query(`
      INSERT INTO users (userId, departmentId, userNumber, userName, userMail, roleId, password, status, profileImage, createdAt, updatedAt)
      VALUES (8888, 1, 'CSET888', 'Aravinth Raj R', 'aravinthr239@gmail.com', 5, '${defaultPasswordHash}', 'Active', '/uploads/default.jpg', NOW(), NOW())
      ON DUPLICATE KEY UPDATE userName = 'Aravinth Raj R', roleId = 5, status = 'Active', departmentId = 1, updatedAt = NOW();
    `);

    // sks-cse@nec.edu.in (userId: 9999)
    await sequelize.query(`
      INSERT INTO users (userId, departmentId, userNumber, userName, userMail, roleId, password, status, profileImage, createdAt, updatedAt)
      VALUES (9999, 1, 'CSET999', 'Dr. S. Kalaiselvi', 'sks-cse@nec.edu.in', 5, '${defaultPasswordHash}', 'Active', '/uploads/default.jpg', NOW(), NOW())
      ON DUPLICATE KEY UPDATE userName = 'Dr. S. Kalaiselvi', roleId = 5, status = 'Active', departmentId = 1, updatedAt = NOW();
    `);

    // hod@mailsac.com (userId: 7777, roleId: 2 - Department Admin / HOD)
    await sequelize.query(`
      INSERT INTO users (userId, departmentId, userNumber, userName, userMail, roleId, password, status, profileImage, createdAt, updatedAt)
      VALUES (7777, 1, 'CSEHOD01', 'Dr. V. Gomathi', 'hod@mailsac.com', 2, '${defaultPasswordHash}', 'Active', '/uploads/default.jpg', NOW(), NOW())
      ON DUPLICATE KEY UPDATE userName = 'Dr. V. Gomathi', roleId = 2, status = 'Active', departmentId = 1, updatedAt = NOW();
    `);

    // 3. Upsert staff_details for the 3 users
    console.log('3. Upserting staff_details...');
    await sequelize.query(`
      INSERT INTO staff_details (
        staffId, staffNumber, Userid, firstName, lastName, gender, DOB, personalEmail, employeeMail, officialEmail,
        mobileNumber, currentAddressLine1, currentCity, currentState, currentPincode, departmentId, designationId,
        designation, DOJ, employmentStatus, status, createdAt, updatedAt
      )
      VALUES (
        8888, 'CSET888', 8888, 'Aravinth', 'Raj R', 'Male', '1995-08-15', 'aravinthr239@gmail.com', 'aravinthr239@gmail.com', 'aravinthr239@gmail.com',
        '9876543210', 'NEC Campus', 'Kovilpatti', 'Tamil Nadu', '628503', 1, 1,
        'Assistant Professor', '2020-01-01', 'Active', 'Active', NOW(), NOW()
      )
      ON DUPLICATE KEY UPDATE firstName = 'Aravinth', lastName = 'Raj R', personalEmail = 'aravinthr239@gmail.com', officialEmail = 'aravinthr239@gmail.com', designation = 'Assistant Professor', departmentId = 1, status = 'Active', updatedAt = NOW();
    `);

    await sequelize.query(`
      INSERT INTO staff_details (
        staffId, staffNumber, Userid, firstName, lastName, gender, DOB, personalEmail, employeeMail, officialEmail,
        mobileNumber, currentAddressLine1, currentCity, currentState, currentPincode, departmentId, designationId,
        designation, DOJ, employmentStatus, status, createdAt, updatedAt
      )
      VALUES (
        9999, 'CSET999', 9999, 'Dr. S.', 'Kalaiselvi', 'Female', '1985-05-20', 'sks-cse@nec.edu.in', 'sks-cse@nec.edu.in', 'sks-cse@nec.edu.in',
        '9876543211', 'NEC Campus', 'Kovilpatti', 'Tamil Nadu', '628503', 1, 1,
        'Associate Professor', '2015-06-01', 'Active', 'Active', NOW(), NOW()
      )
      ON DUPLICATE KEY UPDATE firstName = 'Dr. S.', lastName = 'Kalaiselvi', personalEmail = 'sks-cse@nec.edu.in', officialEmail = 'sks-cse@nec.edu.in', designation = 'Associate Professor', departmentId = 1, status = 'Active', updatedAt = NOW();
    `);

    await sequelize.query(`
      INSERT INTO staff_details (
        staffId, staffNumber, Userid, firstName, lastName, gender, DOB, personalEmail, employeeMail, officialEmail,
        mobileNumber, currentAddressLine1, currentCity, currentState, currentPincode, departmentId, designationId,
        designation, DOJ, employmentStatus, status, createdAt, updatedAt
      )
      VALUES (
        7777, 'CSEHOD01', 7777, 'Dr. V.', 'Gomathi', 'Female', '1975-03-10', 'hod@mailsac.com', 'hod@mailsac.com', 'hod@mailsac.com',
        '9876543212', 'NEC Campus', 'Kovilpatti', 'Tamil Nadu', '628503', 1, 1,
        'Professor & Head of Department', '2005-01-01', 'Active', 'Active', NOW(), NOW()
      )
      ON DUPLICATE KEY UPDATE firstName = 'Dr. V.', lastName = 'Gomathi', gender = 'Female', personalEmail = 'hod@mailsac.com', officialEmail = 'hod@mailsac.com', designation = 'Professor & Head of Department', departmentId = 1, status = 'Active', updatedAt = NOW();
    `);

    // 4. Populate Period table with the exact 8 periods and times
    console.log('4. Populating Period table with 8 periods...');
    const periods = [
      { num: 1, start: '09:00:00', end: '10:00:00' },
      { num: 2, start: '10:00:00', end: '10:55:00' },
      { num: 3, start: '11:15:00', end: '12:00:00' },
      { num: 4, start: '12:00:00', end: '12:50:00' },
      { num: 5, start: '13:50:00', end: '14:40:00' },
      { num: 6, start: '14:40:00', end: '15:30:00' },
      { num: 7, start: '15:45:00', end: '16:30:00' },
      { num: 8, start: '16:30:00', end: '17:15:00' },
    ];

    for (const p of periods) {
      await sequelize.query(`
        INSERT INTO Period (periodNumber, startTime, endTime, isActive, createdDate, updatedDate, createdAt, updatedAt)
        VALUES (${p.num}, '${p.start}', '${p.end}', 'YES', NOW(), NOW(), NOW(), NOW())
        ON DUPLICATE KEY UPDATE startTime = '${p.start}', endTime = '${p.end}', isActive = 'YES', updatedDate = NOW(), updatedAt = NOW();
      `);
    }

    // 5. Update student_details with names from users table
    console.log('5. Updating student names...');
    await sequelize.query(`
      UPDATE student_details s
      JOIN users u ON s.Userid = u.userId
      SET s.studentName = u.userName
      WHERE u.userName IS NOT NULL AND TRIM(u.userName) != '';
    `);

    await sequelize.query(`
      UPDATE student_details
      SET studentName = CONCAT('Student ', registerNumber)
      WHERE studentName IS NULL OR TRIM(studentName) = '';
    `);

    // 6. Assign tutor wards to sks-cse@nec.edu.in (staffId: 9999) and aravinthr239@gmail.com (staffId: 8888)
    console.log('6. Assigning tutor wards to sks-cse (9999) and aravinth (8888)...');
    await sequelize.query(`
      UPDATE student_details
      SET staffId = 9999
      WHERE semester = '5'
      ORDER BY registerNumber ASC
      LIMIT 20;
    `);

    await sequelize.query(`
      UPDATE student_details
      SET staffId = 8888
      WHERE semester = '5' AND staffId != 9999
      ORDER BY registerNumber ASC
      LIMIT 20;
    `);

    // 7. Assign Staff Courses for this semester (Semester 5, semesterId: 13)
    console.log('7. Assigning courses to staff in StaffCourse...');
    // Aravinth (8888): Courses 90 (Modern Web Tech), 91 (AI), 95 (OOAD)
    const aravinthCourses = [
      { courseId: 90, sectionId: 12 },
      { courseId: 91, sectionId: 9 },
      { courseId: 95, sectionId: 3 },
    ];
    for (const c of aravinthCourses) {
      await sequelize.query(`
        INSERT INTO StaffCourse (Userid, courseId, sectionId, departmentId, createdDate, updatedDate, createdAt, updatedAt)
        SELECT 8888, ${c.courseId}, ${c.sectionId}, 1, NOW(), NOW(), NOW(), NOW()
        FROM DUAL
        WHERE NOT EXISTS (
          SELECT 1 FROM StaffCourse WHERE Userid = 8888 AND courseId = ${c.courseId} AND sectionId = ${c.sectionId}
        );
      `);
    }

    // SKS (9999): Courses 88 (DevOps & Agile), 89 (Theory of Computation), 92 (Simulation Tool)
    const sksCourses = [
      { courseId: 88, sectionId: 18 },
      { courseId: 89, sectionId: 15 },
      { courseId: 92, sectionId: 6 },
    ];
    for (const c of sksCourses) {
      await sequelize.query(`
        INSERT INTO StaffCourse (Userid, courseId, sectionId, departmentId, createdDate, updatedDate, createdAt, updatedAt)
        SELECT 9999, ${c.courseId}, ${c.sectionId}, 1, NOW(), NOW(), NOW(), NOW()
        FROM DUAL
        WHERE NOT EXISTS (
          SELECT 1 FROM StaffCourse WHERE Userid = 9999 AND courseId = ${c.courseId} AND sectionId = ${c.sectionId}
        );
      `);
    }

    // HOD (7777): Course 103 (Web frameworks using python)
    await sequelize.query(`
      INSERT INTO StaffCourse (Userid, courseId, sectionId, departmentId, createdDate, updatedDate, createdAt, updatedAt)
      SELECT 7777, 103, 21, 1, NOW(), NOW(), NOW(), NOW()
      FROM DUAL
      WHERE NOT EXISTS (
        SELECT 1 FROM StaffCourse WHERE Userid = 7777 AND courseId = 103 AND sectionId = 21
      );
    `);

    // 8. Clean up and populate Timetable entries
    console.log('8. Configuring Timetable entries...');
    await sequelize.query(`
      DELETE FROM Timetable WHERE courseId = 88 AND dayOfWeek = 'WED' AND periodNumber = 7 AND timetableId > 15;
    `);

    await sequelize.query(`UPDATE Timetable SET sectionId = 18 WHERE courseId = 88 AND (sectionId IS NULL OR sectionId = 0);`);
    await sequelize.query(`UPDATE Timetable SET sectionId = 15 WHERE courseId = 89 AND (sectionId IS NULL OR sectionId = 0);`);
    await sequelize.query(`UPDATE Timetable SET sectionId = 12 WHERE courseId = 90 AND (sectionId IS NULL OR sectionId = 0);`);
    await sequelize.query(`UPDATE Timetable SET sectionId = 9 WHERE courseId = 91 AND (sectionId IS NULL OR sectionId = 0);`);
    await sequelize.query(`UPDATE Timetable SET sectionId = 6 WHERE courseId = 92 AND (sectionId IS NULL OR sectionId = 0);`);
    await sequelize.query(`UPDATE Timetable SET sectionId = 3 WHERE courseId = 95 AND (sectionId IS NULL OR sectionId = 0);`);

    const standardWeeklySchedule = [
      // MON
      { courseId: 88, sectionId: 18, day: 'MON', period: 1, semId: 13 },
      { courseId: 91, sectionId: 9,  day: 'MON', period: 2, semId: 13 },
      { courseId: 89, sectionId: 15, day: 'MON', period: 3, semId: 13 },
      { courseId: 95, sectionId: 3,  day: 'MON', period: 4, semId: 13 },
      { courseId: 91, sectionId: 9,  day: 'MON', period: 5, semId: 13 },
      { courseId: 91, sectionId: 9,  day: 'MON', period: 6, semId: 13 },
      { courseId: 90, sectionId: 12, day: 'MON', period: 7, semId: 13 },
      { courseId: 90, sectionId: 12, day: 'MON', period: 8, semId: 13 },
      // TUE
      { courseId: 88, sectionId: 18, day: 'TUE', period: 1, semId: 13 },
      { courseId: 103, sectionId: 21, day: 'TUE', period: 2, semId: 13 },
      { courseId: 95, sectionId: 3,  day: 'TUE', period: 3, semId: 13 },
      { courseId: 89, sectionId: 15, day: 'TUE', period: 4, semId: 13 },
      { courseId: 90, sectionId: 12, day: 'TUE', period: 5, semId: 13 },
      { courseId: 90, sectionId: 12, day: 'TUE', period: 6, semId: 13 },
      { courseId: 92, sectionId: 6,  day: 'TUE', period: 7, semId: 13 },
      // WED
      { courseId: 89, sectionId: 15, day: 'WED', period: 1, semId: 13 },
      { courseId: 90, sectionId: 12, day: 'WED', period: 2, semId: 13 },
      { courseId: 88, sectionId: 18, day: 'WED', period: 3, semId: 13 },
      { courseId: 95, sectionId: 3,  day: 'WED', period: 4, semId: 13 },
      { courseId: 91, sectionId: 9,  day: 'WED', period: 5, semId: 13 },
      { courseId: 89, sectionId: 15, day: 'WED', period: 6, semId: 13 },
      { courseId: 88, sectionId: 18, day: 'WED', period: 7, semId: 13 },
      { courseId: 88, sectionId: 18, day: 'WED', period: 8, semId: 13 },
      // THU
      { courseId: 91, sectionId: 9,  day: 'THU', period: 1, semId: 13 },
      { courseId: 88, sectionId: 18, day: 'THU', period: 2, semId: 13 },
      { courseId: 89, sectionId: 15, day: 'THU', period: 3, semId: 13 },
      { courseId: 92, sectionId: 6,  day: 'THU', period: 4, semId: 13 },
      { courseId: 90, sectionId: 12, day: 'THU', period: 5, semId: 13 },
      { courseId: 90, sectionId: 12, day: 'THU', period: 6, semId: 13 },
      // FRI
      { courseId: 95, sectionId: 3,  day: 'FRI', period: 1, semId: 13 },
      { courseId: 88, sectionId: 18, day: 'FRI', period: 2, semId: 13 },
      { courseId: 91, sectionId: 9,  day: 'FRI', period: 3, semId: 13 },
      { courseId: 89, sectionId: 15, day: 'FRI', period: 4, semId: 13 },
      { courseId: 92, sectionId: 6,  day: 'FRI', period: 5, semId: 13 },
      { courseId: 90, sectionId: 12, day: 'FRI', period: 6, semId: 13 },
    ];

    for (const tt of standardWeeklySchedule) {
      await sequelize.query(`
        INSERT INTO Timetable (courseId, sectionId, dayOfWeek, periodNumber, departmentId, semesterId, isActive, createdDate, updatedDate, createdAt, updatedAt)
        SELECT ${tt.courseId}, ${tt.sectionId}, '${tt.day}', ${tt.period}, 1, ${tt.semId}, 'YES', NOW(), NOW(), NOW(), NOW()
        FROM DUAL
        WHERE NOT EXISTS (
          SELECT 1 FROM Timetable WHERE courseId = ${tt.courseId} AND dayOfWeek = '${tt.day}' AND periodNumber = ${tt.period}
        );
      `);
    }

    // 9. PeriodAttendance sample entries for today and recent dates
    console.log('9. Ensuring PeriodAttendance records...');
    const today = new Date().toISOString().split('T')[0];
    const targetDates = [today, '2026-07-30'];

    const [wards9999] = (await sequelize.query(
      `SELECT registerNumber FROM student_details WHERE staffId = 9999;`
    )) as any;

    const [wards8888] = (await sequelize.query(
      `SELECT registerNumber FROM student_details WHERE staffId = 8888;`
    )) as any;

    const allWards = [...(wards9999 || []), ...(wards8888 || [])];

    for (const d of targetDates) {
      for (let i = 0; i < allWards.length; i++) {
        const regno = allWards[i].registerNumber;
        const status = i % 10 === 0 ? 'A' : i % 10 === 1 ? 'OD' : 'P';
        for (let p = 1; p <= 4; p++) {
          await sequelize.query(`
            INSERT INTO PeriodAttendance (regno, staffId, courseId, sectionId, semesterNumber, dayOfWeek, periodNumber, attendanceDate, status, departmentId, updatedBy)
            SELECT '${regno}', 9999, 88, 18, 5, 'THU', ${p}, '${d}', '${status}', 1, 'Staff'
            FROM DUAL
            WHERE NOT EXISTS (
              SELECT 1 FROM PeriodAttendance WHERE regno = '${regno}' AND attendanceDate = '${d}' AND periodNumber = ${p}
            );
          `);
        }
      }
    }

    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✅ Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;').catch(() => {});
  } finally {
    await sequelize.close();
  }
}

seed();
