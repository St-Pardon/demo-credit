import { Router } from 'express';
import AccountController from '../controllers/account.controller';

const AccountRoute = Router();

AccountRoute.get('/create', AccountController.create)
  .get('/balance', AccountController.balance)
  .get('/account-info', AccountController.accountInfo)
  .get('/user-accounts', AccountController.userAccounts)
  .put('/fund', AccountController.fund)
  .put('/transfer', AccountController.transfer)
  .patch('/withdraw');

export default AccountRoute;
