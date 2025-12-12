import { Request, Response } from 'express';
import Classification, { IClassification } from '../models/Classification';

type MatchResult = 'W' | 'L';

export const getClassification = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    
    console.log('Classification query:', query);
    
    const classifications = await Classification.find(query)
      .populate('team', 'name logo')
      .sort({ points: -1, pointsDifference: -1, pointsFor: -1 });
    
    console.log('Found classifications:', classifications.length);
    
    // Transform the data to match frontend requirements
    const transformedData = classifications.map((classification, index) => {
      const teamData = classification.team as any; // Handle populated team data
      
      return {
        _id: classification._id,
        team: {
          _id: teamData._id,
          name: teamData.name,
          logo: teamData.logo
        },
        category: classification.category,
        played: classification.played,
        wins: classification.wins,
        losses: classification.losses,
        pointsFor: classification.pointsFor,
        pointsAgainst: classification.pointsAgainst,
        pointsDifference: classification.pointsDifference,
        points: classification.points,
        recentResults: classification.recentResults,
        position: index + 1
      };
    });
    
    console.log('Transformed data:', transformedData.length, 'items');
    
    res.json({ 
      success: true,
      data: transformedData 
    });
  } catch (error: any) {
    console.error('Error fetching classification:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export const updateClassification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { teamId, category, poule, result, pointsFor, pointsAgainst } = req.body;
    
    if (!teamId || !category || !result) {
      res.status(400).json({ 
        success: false,
        error: 'Missing required fields' 
      });
      return;
    }

    let query: any = { team: teamId, category };
    
    // Add poule to query if provided
    if (poule) {
      query.poule = poule;
    }

    const classification = await Classification.findOne(query);

    if (!classification) {
      res.status(404).json({ 
        success: false,
        error: 'Classification not found' 
      });
      return;
    }

    // Update based on match result
    classification.played += 1;
    if (result === 'win') {
      classification.wins += 1;
      classification.points += 2;
      classification.recentResults = ['W' as MatchResult, ...classification.recentResults].slice(0, 5);
    } else if (result === 'loss') {
      classification.losses += 1;
      classification.points += 1;
      classification.recentResults = ['L' as MatchResult, ...classification.recentResults].slice(0, 5);
    }

    // Update points if provided
    if (pointsFor !== undefined && pointsAgainst !== undefined) {
      classification.pointsFor += pointsFor;
      classification.pointsAgainst += pointsAgainst;
      classification.pointsDifference = classification.pointsFor - classification.pointsAgainst;
    }

    await classification.save();

    res.json({ 
      success: true,
      data: classification 
    });
  } catch (error: any) {
    console.error('Error updating classification:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};