import { Router } from 'express';
import AuthController from '../controllers/auth.controller';

const Auth = Router();

Auth.post('/signup', AuthController.signup).post(
  '/signin',
  AuthController.signin
);

export default Auth;
