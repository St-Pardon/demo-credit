import { Router } from 'express';
import AccountController from '../controllers/account.controller';

const AccountRoute = Router();

AccountRoute.get('/create', AccountController.create)
  .get('/balance', AccountController.balance)
  .get('/account-info', AccountController.accountInfo)
  .get('/user-accounts', AccountController.userAccounts)
  .put('/transfer', AccountController.transfer)
  .put('/fund', AccountController.fund)
  .put('/withdraw', AccountController.withdraw);

export default AccountRoute;
