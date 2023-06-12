import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import database from '../config/db.config';
import generateAccountNumbers from '../utils/generatenum.utils';
import { AccountInfo } from '../utils/types.utils';

class AccountController {
  /**
   * create a new account
   * @param {Request} req  Request object
   * @param {Response} res Response object
   * @returns {Promise<void>}
   */
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

  /**
   * fund an account
   * @param {Request} req  Request object
   * @param {Response} res Response object
   * @returns {Promise<void>}
   */
  static async fund(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    const { account_no, balance } = req.body;

    const update = await database('accounts')
      .where('account_no', parseInt(account_no))
      .increment('balance', parseFloat(balance))
      .update({ updated_at: new Date() });

    if (!update) {
      res.status(400).json({ err: 'transaction failed' });
      return;
    }

    res.status(200).json({ msg: 'fund deposited' });
  }

  /**
   * retrieve balance of an account
   * @param {Request} req  Request object
   * @param {Response} res Response object
   * @returns {Promise<void>}
   */
  static async balance(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    const { account_no = 0 } = req.query;
    const { user_id } = req.user;

    const balance = await database('accounts')
      .select('balance')
      .where({ account_no: parseInt(account_no.toString()), user_id })
      .first();

    if (!balance) {
      res.status(400).json({ err: 'Cannot get balance, Try again later' });
    }

    res.status(200).json(balance);
  }

  /**
   * retrieve an accounts information
   * @param {Request} req  Request object
   * @param {Response} res Response object
   * @returns {Promise<void>}
   */
  static async accountInfo(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    const { account_no = 0 } = req.query;
    const { user_id } = req.user;

    const balance = await database('accounts')
      .where({ account_no: parseInt(account_no.toString()), user_id })
      .first();

    if (!balance) {
      res.status(400).json({ err: 'Cannot get balance, Try again later' });
    }

    res.status(200).json(balance);
  }

  /**
   * retrieve all accounts from a user
   * @param {Request} req  Request object
   * @param {Response} res Response object
   * @returns {Promise<void>}
   */
  static async userAccounts(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    const { user_id } = req.user;

    const balance = await database('accounts').where({ user_id });
    if (!balance) {
      res.status(400).json({ err: 'Cannot get balance, Try again later' });
    }

    res.status(200).json(balance);
  }

  /**
   * transfer fund between accounts
   * @param {Request} req  Request object
   * @param {Response} res Response object
   * @returns {Promise<void>}
   */
  static async transfer(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    const { senderAccount, recipientAccount, amount, comment } = req.body;

    await database.transaction(async (trx) => {
      try {
        await database('accounts')
          .transacting(trx)
          .where('account_no', parseInt(senderAccount))
          .decrement('balance', parseFloat(amount))
          .update({ updated_at: new Date() });
        await database('accounts')
          .transacting(trx)
          .where('account_no', parseInt(recipientAccount))
          .increment('balance', parseFloat(amount))
          .update({ updated_at: new Date() });

        const data = {
          transaction_id: uuidv4(),
          to: recipientAccount,
          from: senderAccount,
          amount,
          comment,
          status: 'successful',
        };

        await database('transactions')
          .transacting(trx)
          .insert({
            id: uuidv4(),
            transaction_type: 'debit',
            description: `Fund transfer from ${senderAccount} to ${recipientAccount}`,
            ...data,
          });
        await database('transactions')
          .transacting(trx)
          .insert({
            id: uuidv4(),
            transaction_type: 'credit',
            description: `Fund transfer from ${senderAccount} to ${recipientAccount}`,
            ...data,
          });

        await trx.commit();

        res.status(200).json({ msg: 'Transaction Successful' });
      } catch (error) {
        console.error('Transaction failed:', error);
        await trx.rollback();

        await database('transactions').insert({
          id: uuidv4(),
          transaction_type: 'debit',
          description: `Fund transfer from ${senderAccount} to ${recipientAccount}`,
          transaction_id: uuidv4(),
          to: recipientAccount,
          from: senderAccount,
          amount,
          comment,
          status: 'failed',
        });
        res.status(400).json({ msg: 'Transaction Failed' });
      }
    });
  }
}

export default AccountController;
