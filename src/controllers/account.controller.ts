import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import database from '../config/db.config';
import generateAccountNumbers from '../utils/generatenum.utils';
import { AccountInfo } from '../utils/types.utils';
import { verifyAccount } from '../utils/transaction.utils';

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
    const { account_no, amount, comment } = req.body;
    const { user_id } = req.user;
    const transaction_id = uuidv4();

    if (!account_no || !amount) {
      res.status(400).json({
        err: 'Provided amount and account information',
      });
      return;
    }

    if (!(await verifyAccount(account_no, user_id))) {
      res.status(400).json({
        err: 'Invalid account number',
        reason: 'account do not exist or belong to this user',
      });
      return;
    }

    await database.transaction(async (trx) => {
      try {
        await database('accounts')
          .transacting(trx)
          .where({ account_no: parseInt(account_no) })
          .andWhere({ user_id })
          .increment('balance', parseFloat(amount))
          .update({ updated_at: new Date() });

        await database('transactions')
          .transacting(trx)
          .insert({
            id: uuidv4(),
            transaction_type: 'credit',
            description: `Fund deposit to ${account_no}`,
            transaction_id,
            to: account_no,
            amount,
            comment,
          });

        await trx.commit();

        res.status(200).json({ msg: 'Deposit Successful', transaction_id });
      } catch (error) {
        res.status(400).json({ msg: 'Deposit Failed' });
      }
    });
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

    if (!account_no) {
      res.status(400).json({
        err: 'Provided account information',
      });
      return;
    }

    const balance = await database('accounts')
      .select('balance')
      .where({ account_no: parseInt(account_no.toString()), user_id })
      .first();

    if (!balance) {
      res
        .status(400)
        .json({ err: 'Cannot get balance for this account, Try again later' });
      return;
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

    if (!account_no) {
      res.status(400).json({
        err: 'Provided account information',
      });
      return;
    }

    if (!(await verifyAccount(parseInt(account_no.toString()), user_id))) {
      res.status(400).json({
        err: 'Invalid account number',
        reason: 'account do not exist or belong to this user',
      });
      return;
    }

    const info = await database('accounts')
      .where({ account_no: parseInt(account_no.toString()), user_id })
      .first();

    if (!info) {
      res.status(400).json({ err: 'Cannot get balance, Try again later' });
      return;
    }

    res.status(200).json(info);
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

    const accounts = await database('accounts').where({
      user_id,
    });
    if (!accounts) {
      res.status(400).json({ err: 'Cannot get balance, Try again later' });
      return;
    }

    res.status(200).json(accounts);
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
    const { user_id } = req.user;
    const transaction_id = uuidv4();

    if (!(await verifyAccount(senderAccount, user_id))) {
      res.status(400).json({
        err: 'Invalid account number',
        reason: 'account do not exist or belong to this user',
      });
    }

    await database.transaction(async (trx) => {
      try {
        await database('accounts')
          .transacting(trx)
          .where({ account_no: parseInt(senderAccount) })
          .decrement('balance', parseFloat(amount))
          .update({ updated_at: new Date() });

        await database('accounts')
          .transacting(trx)
          .where('account_no', parseInt(recipientAccount))
          .increment('balance', parseFloat(amount))
          .update({ updated_at: new Date() });

        const data = {
          transaction_id,
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

        res.status(200).json({ msg: 'Transaction Successful', transaction_id });
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

        res.status(400).json({ msg: 'Transaction Failed', transaction_id });
      }
    });
  }

  static async withdraw(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    const { account_no, amount, comment } = req.body;
    const { user_id } = req.user;
    const transaction_id = uuidv4();

    if (!account_no || !amount) {
      res.status(400).json({
        err: 'Provided amount and account information',
      });
      return;
    }

    if (!(await verifyAccount(account_no, user_id))) {
      res.status(400).json({
        err: 'Invalid account number',
        reason: 'account do not exist or belong to this user',
      });
    }

    await database.transaction(async (trx) => {
      try {
        await database('accounts')
          .transacting(trx)
          .where({ account_no: parseInt(account_no), user_id })
          .decrement('balance', parseFloat(amount))
          .update({ updated_at: new Date() });

        await database('transactions')
          .transacting(trx)
          .insert({
            id: uuidv4(),
            transaction_type: 'debit',
            description: `Fund withrawal from ${account_no}`,
            transaction_id,
            from: account_no,
            amount,
            comment,
          });

        await trx.commit();

        res.status(200).json({ msg: 'Withdrawal Successful', transaction_id });
      } catch (error) {
        res.status(400).json({ msg: 'Withdrawal Failed' });
      }
    });
  }
}

export default AccountController;
