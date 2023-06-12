import { Router } from 'express';
import TransactionController from '../controllers/transaction.controller';

const TransactionRoute = Router();

TransactionRoute.get('/', TransactionController.getTransactions)
  .get('/:transaction_id', TransactionController.getTransactionByID)
  .delete('/:transaction_id', TransactionController.deleteTransaction);

export default TransactionRoute;
