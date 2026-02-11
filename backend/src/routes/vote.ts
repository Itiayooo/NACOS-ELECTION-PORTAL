import express from 'express';
import { getVotingData, castVote, getVotingReceipt } from '../controllers/voteController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/data', authenticate, getVotingData);
router.post('/cast', authenticate, castVote);
router.get('/receipt', authenticate, getVotingReceipt);

export default router;
