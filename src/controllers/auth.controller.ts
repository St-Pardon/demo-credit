import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.config';

class AuthController {
  /**
   * Authenticate user by signin
   * @param req
   * @param res
   * @param next
   */
  static async signin(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    passport.authenticate('signin', async (err: any, user: any) => {
      try {
        if (err) {
          res.status(403).json({ error: 'Email or password is incorrect' });
        }
        if (!user) {
          res.status(404).json({ error: 'User do not exist' });
        }
        req.login(user, { session: false }, async (error) => {
          if (error) return next(error);
          const body = { user_id: user.user_id, email: user.email };
          const token = jwt.sign({ user: body }, JWT_SECRET, {
            expiresIn: '24h',
          });
          return res
            .status(200)
            .json({ message: 'Signin successful', token, body });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  }

  /**
   * creates a new user account
   * @param req
   * @param res
   * @param next
   */
  static async signup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    passport.authenticate('signup', async (err: any, user: any) => {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (!user) {
        res.status(403).json({ err: 'User already exist' });
        return;
      }
      res.status(201).json({ msg: 'signup successful', user });
    })(req, res, next);
  }
}

export default AuthController;
