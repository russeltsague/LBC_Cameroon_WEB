import express from 'express';
import {
  createPlayer,
  getPlayersByTeam,
  updatePlayer,
  deletePlayer
} from '../controllers/playerController';

const router = express.Router();

router.get('/team/:teamId', getPlayersByTeam);
router.post('/', createPlayer);
router.put('/:id', updatePlayer);
router.delete('/:id', deletePlayer);

export default router;