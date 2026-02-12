import express from 'express';
import { authenticate, adminOnly } from '../middleware/auth';
import { 
  getCollegeEligibility,
  addCollegeEligibility,
  removeCollegeEligibility,
  getDepartmentEligibility,
  addDepartmentEligibility,
  removeDepartmentEligibility,
  bulkUploadCollegeEligibility,
  bulkUploadDepartmentEligibility
} from '../controllers/eligibilityController';

const router = express.Router();

router.use(authenticate, adminOnly);

// College eligibility
router.get('/college', getCollegeEligibility);
router.post('/college', addCollegeEligibility);
router.delete('/college/:studentId', removeCollegeEligibility);
router.post('/college/bulk', bulkUploadCollegeEligibility);

// Department eligibility
router.get('/department', getDepartmentEligibility);
router.post('/department', addDepartmentEligibility);
router.delete('/department/:id', removeDepartmentEligibility);
router.post('/department/bulk', bulkUploadDepartmentEligibility);

export default router;