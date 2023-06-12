import database from '../config/db.config';

/**
 * verify if account exists and belongs to the right user
 * @param {number} account_no - user's account number
 * @param {string} user_id - user's id
 * @returns {Promise<boolean>} - boolean
 */
export const verifyAccount = async (
  account_no: number,
  user_id: string
): Promise<boolean> => {
  const account = await database('accounts')
    .select()
    .where({ account_no, user_id })
    .first();

  if (!account) {
    return false;
  }
  return true;
};

/**
 * verify's if transaction id belongs to the user's account
 * @param {number} account_no - user's account number
 * @param {string} transaction_id - transaction id
 * @returns {Promise<boolean>} - boolean
 */
export const verifyTransaction = async (
  account_no: number,
  transaction_id: string
): Promise<boolean> => {
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

  if (transaction.length > 0) {
    return true;
  }
  return false;
};
