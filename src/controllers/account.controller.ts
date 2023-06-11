import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import database from '../config/db.config';
import generateAccountNumbers from '../utils/generatenum.utils';
import { AccountInfo } from '../utils/types.utils';

class AccountController {
  static async create(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    try {
      const { account_type } = req.query;
      const { user_id } = req.user;

      const account_no = generateAccountNumbers();
      const account_info: AccountInfo = {
        account_id: uuidv4(),
        user_id,
        account_type,
        account_no,
      };
      const account = await database('accounts').insert(account_info);

      if (account.length < 0) {
        res.status(500).json({ err: 'An error occured' });
        return;
      }

      res.status(201).json(account_info);
    } catch (error) {
      console.error('Error retrieving users:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async fund(req: Request, res: Response): Promise<void> {}
}

export default AccountController;
