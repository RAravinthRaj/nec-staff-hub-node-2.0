/* 
© 2025 Aravinth Raj R. All rights reserved.
Unauthorized copying of this file, via any medium, is strictly prohibited.
Proprietary and confidential.  
Written by Aravinth Raj R <aravinthr235@gmail.com>, 2025.
*/
import { Department } from '../config/enum.config';

export const isValidDepartment = (value: string): boolean => {
  return Object.values(Department).includes(value as Department);
};
