/*
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/

import { sequelize } from '../config/database';
import { Leave } from '../models';
import { normalizeDocuments } from '../utils/documents';

const run = async () => {
  try {
    await sequelize.authenticate();

    const leaves = await Leave.findAll({
      attributes: ['id', 'documents'],
    });

    let updatedCount = 0;

    for (const leave of leaves) {
      const currentValue = leave.getDataValue('documents');
      const normalizedDocuments = normalizeDocuments(currentValue);
      const serializedCurrent = JSON.stringify(currentValue ?? []);
      const serializedNormalized = JSON.stringify(normalizedDocuments);

      if (serializedCurrent === serializedNormalized) {
        continue;
      }

      leave.setDataValue('documents', normalizedDocuments);
      await leave.save({ fields: ['documents'] });
      updatedCount += 1;
    }

    console.log(`Normalized documents for ${updatedCount} leave request(s).`);
  } catch (error) {
    console.error('Failed to normalize leave documents.', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

void run();
