import { Request, Response } from 'express';
import Team from '../models/Team';

export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.create(req.body);
     res.status(201).json(team);
  } catch (error: any) {
     res.status(400).json({ error: error.message });
  }
};

export const getTeams = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, poule } = req.query;
    
    let query: any = {};
    if (category) {
      query.category = category;
    }
    
    // Add poule filter if provided
    if (poule) {
      query.poule = poule;
    }
    
    const teams = await Team.find(query);
    res.json({
      success: true,
      data: teams
    });
  } catch (error: any) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export const getTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team)  res.status(404).json({ error: 'Team not found' });
     res.json(team);
  } catch (error: any) {
     res.status(500).json({ error: error.message });
  }
};

export const updateTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!team)  res.status(404).json({ error: 'Team not found' });
     res.json(team);
  } catch (error: any) {
     res.status(400).json({ error: error.message });
  }
};

export const deleteTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team)  res.status(404).json({ error: 'Team not found' });
     res.json({ message: 'Team deleted successfully' });
  } catch (error: any) {
     res.status(500).json({ error: error.message });
  }
};