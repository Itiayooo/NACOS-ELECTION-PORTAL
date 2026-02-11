import express from 'express';
import {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
  createOffice,
  getOffices,
  updateOffice,
  deleteOffice,
  createCandidate,
  getCandidates,
  updateCandidate,
  deleteCandidate,
  getResults,
  getStatistics,
  getElectionSettings,
  updateElectionSettings
} from '../controllers/adminController';
import { authenticate, adminOnly } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticate, adminOnly);

// Department routes
router.post('/departments', createDepartment);
router.get('/departments', getDepartments);
router.put('/departments/:id', updateDepartment);
router.delete('/departments/:id', deleteDepartment);

// Office routes
router.post('/offices', createOffice);
router.get('/offices', getOffices);
router.put('/offices/:id', updateOffice);
router.delete('/offices/:id', deleteOffice);

// Candidate routes
router.post('/candidates', upload.single('photo'), createCandidate);
router.get('/candidates', getCandidates);
router.put('/candidates/:id', upload.single('photo'), updateCandidate);
router.delete('/candidates/:id', deleteCandidate);

// Results and analytics
router.get('/results', getResults);
router.get('/statistics', getStatistics);

// Election settings
router.get('/settings', getElectionSettings);
router.put('/settings', updateElectionSettings);

export default router;
