import { Router } from 'express';
import Auth from './auth.route';
import UserRoute from './user.route';
import AccountRoute from './account.route';
import passport, { session } from 'passport';
import TransactionRoute from './transaction.route';

const IndexRoute = Router();

IndexRoute.get('/')
  .use('/auth', Auth)
  .use('/user', passport.authenticate('jwt', { session: false }), UserRoute)
  .use(
    '/account',
    passport.authenticate('jwt', { session: false }),
    AccountRoute
  )
  .use(
    '/transaction',
    passport.authenticate('jwt', { session: false }),
    TransactionRoute
  );

export default IndexRoute;
