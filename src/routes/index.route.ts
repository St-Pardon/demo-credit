import { Router } from 'express';
import Auth from './auth.route';
import UserRoute from './user.route';
import AccountRoute from './account.route';
import passport from 'passport';

const IndexRoute = Router();

IndexRoute.get('/')
  .use('/auth', Auth)
  .use('/users', UserRoute)
  .use(
    '/account',
    passport.authenticate('jwt', { session: false }),
    AccountRoute
  );

export default IndexRoute;
