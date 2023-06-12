import { Request, Response } from 'express';
import database from '../config/db.config';

class UserController {
  /**
   * Get authenticated user's information
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @returns {Promise<void>}
   */
  static async getInfo(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    const { user_id } = req.user;

    try {
      const { password, ...user } = await database('users')
        .select()
        .where({ user_id })
        .first();

      if (!user) {
        res.status(404).json({ msg: 'User not found' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * updates authenticated user's profile
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @returns {Promise<void>}
   */
  static async updateInfo(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    const { first_name, last_name } = req.body;
    const { user_id } = req.user;

    try {
      await database('users')
        .where({ user_id })
        .update({ first_name, last_name, updated_at: new Date() });

      res.status(200).json({ message: 'User updated' });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * retrieves authenticated or unathenicated user's profile
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @returns {Promise<void>}
   */
  static async getUser(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    const { user_id } = req.params;

    try {
      const { password, ...user } = await database('users')
        .select()
        .where({ user_id })
        .first();

      if (!user) {
        res.status(404).json({ msg: 'User not found' });
        return;
      }

      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * deletes authenticated users profile
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @returns {Promise<void>}
   */
  static async deleteInfo(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    const { user_id } = req.user;

    try {
      const accounts = await database('accounts')
        .select('*')
        .where({ user_id });

      if (accounts.length > 0) {
        res.status(400).json({
          msg: 'Cannot delete user with accounts, close all account to delete profile',
        });
        return;
      }

      await database('users').where({ user_id }).del();
      res.status(200).json({ message: 'User deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UserController;
