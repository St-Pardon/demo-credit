import { Request, Response } from 'express';
import database from '../config/db.config';
import { verifyAccount, verifyTransaction } from '../utils/transaction.utils';

class TransactionController {
  /**
   * Retrieves and filters all user's transaction
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @returns {Promise<void>} Promise
   */
  static async getTransactions(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    const {
      status,
      transaction_type,
      amount_gt = 0,
      amount_lt = 0,
      account_no = 0,
      sort = 'created_at',
      by = 'desc',
      page = 1,
      count = 0,
    } = req.query;
    const { user_id } = req.user;

    try {
      if (!(await verifyAccount(parseInt(account_no.toString()), user_id))) {
        res.status(403).json({
          msg: "Not authorized to access account's transaction. Switch to appropriate account",
        });
        return;
      }

      const query = await database('transactions')
        .select()
        .where(function () {
          this.where(function () {
            this.where({ from: account_no, transaction_type: 'debit' }).orWhere(
              {
                to: account_no,
                transaction_type: 'credit',
              }
            );
          });
          if (status) {
            this.andWhere('status', status);
          }
          if (transaction_type) {
            this.andWhere('transaction_type', transaction_type);
          }
          if (amount_gt) {
            const amountNumber = Number(amount_gt);
            if (!isNaN(amountNumber)) {
              this.andWhere('amount', '>', amountNumber);
            }
          }
          if (amount_lt) {
            const amountNumber = Number(amount_lt);
            if (!isNaN(amountNumber)) {
              this.andWhere('amount', '<', amountNumber);
            }
          }
        })
        .orderBy(sort.toString(), by.toString())
        .limit(Number(count.toString()) || 10)
        .offset(((Number(page) || 1) - 1) * (Number(count.toString()) || 10));

      res.status(200).json(query);
    } catch (error) {
      res.status(500).json({
        msg: 'Internal server error',
      });
    }
  }

  /**
   * Creates a single user's transaction by its id
   * @param {Request} req - request object
   * @param {Response} res - response object
   * @returns {Promise<void>} Promise
   */
  static async getTransactionByID(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    const { transaction_id } = req.params;
    const { account_no = 0 } = req.query;
    const { user_id } = req.user;

    try {
      if (!(await verifyAccount(parseInt(account_no.toString()), user_id))) {
        res.status(403).json({
          msg: "Not authorized to access account's transaction. Switch to appropriate account",
        });
        return;
      }

      if (
        await verifyTransaction(parseInt(account_no.toString()), transaction_id)
      ) {
        res.status(403).json({
          msg: "Not authorized to access transaction's information.",
        });
        return;
      }

      const transaction = await database('transactions')
        .select()
        .where(function () {
          this.where({
            from: account_no,
            transaction_type: 'debit',
            transaction_id,
          }).orWhere({
            to: account_no,
            transaction_type: 'credit',
            transaction_id,
          });
        })
        .first();

      res.status(200).json({ msg: 'Successful', transaction });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  /**
   * Delete an authenicated user's transaction record from the database
   * @param {Request} req -  Request object
   * @param {Response} res - Response object
   * @returns {Promise<void>} Promise
   */
  static async deleteTransaction(
    req: Request & { user?: any },
    res: Response
  ): Promise<void> {
    const { transaction_id } = req.params;
    const { account_no = 0 } = req.query;
    const { user_id } = req.user;

    try {
      if (!(await verifyAccount(parseInt(account_no.toString()), user_id))) {
        res.status(403).json({
          msg: "Not authorized to access account's transaction. Switch to appropriate account",
        });
        return;
      }

      if (
        await verifyTransaction(parseInt(account_no.toString()), transaction_id)
      ) {
        res.status(403).json({
          msg: "Not authorized to access transaction's information.",
        });
        return;
      }

      await database('transactions')
        .where(function () {
          this.where({
            from: account_no,
            transaction_type: 'debit',
            transaction_id,
          }).orWhere({
            to: account_no,
            transaction_type: 'credit',
            transaction_id,
          });
        })
        .del();

      res.status(200).json({ message: 'Transaction deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default TransactionController;
