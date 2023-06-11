import { Request, Response, Router } from 'express';
import database from '../config/db.config';

const UserRoute = Router();

UserRoute.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await database('users').select('*');
    res.status(200).json(users);
  } catch (error) {
    console.error('Error retrieving users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default UserRoute;
