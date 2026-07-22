/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { Sequelize } from 'sequelize';
import { config } from '../config/config';

export const sequelize = new Sequelize(
  config.mySqlDatabaseName,
  config.mySqlUser,
  config.mySqlPassword,
  {
    host: config.mySqlHost,
    port: config.mySqlPort,
    dialect: 'mysql',

    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },

    logging: false,
  },
);
