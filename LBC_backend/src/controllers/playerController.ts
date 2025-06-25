import { Request, Response } from 'express';
import Player from '../models/Player';

export const createPlayer = async (req: Request, res: Response): Promise<void> => {
  try {
    const player = await Player.create(req.body);
    res.status(201).json(player);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getPlayersByTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const players = await Player.find({ teamId: req.params.teamId });
    res.json(players);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePlayer = async (req: Request, res: Response): Promise<void> => {
  try {
    const player = await Player.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!player) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }
    res.json(player);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePlayer = async (req: Request, res: Response): Promise<void> => {
  try {
    const player = await Player.findByIdAndDelete(req.params.id);
    if (!player) {
      res.status(404).json({ error: 'Player not found' });
      return;
    }
    res.json({ message: 'Player deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
