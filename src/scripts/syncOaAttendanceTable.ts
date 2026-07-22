/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { sequelize } from '../config/database';
import { OAAttendance } from '../models';

const run = async () => {
  try {
    await sequelize.authenticate();
    await OAAttendance.sync();
    console.log('oa_attendance table is ready.');
  } catch (error) {
    console.error('Failed to sync oa_attendance table.', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

void run();
