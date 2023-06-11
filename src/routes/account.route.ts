import { Router } from 'express';
import AccountController from '../controllers/account.controller';

const AccountRoute = Router();

AccountRoute.get('/create', AccountController.create).put('/fund').patch('/withdraw')

export default AccountRoute;
