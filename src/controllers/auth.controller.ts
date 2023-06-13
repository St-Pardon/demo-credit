import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.config';

class AuthController {
  /**
   * Authenticate user by signin
   * @param {Request} req - Request object
   * @param {Response} res - Response object
   * @param {NextFunction} next - Function
   * @returns {Promise<void>}
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
          return;
        }
        if (!user) {
          res.status(404).json({ error: 'User do not exist' });
          return;
        }
        req.login(user, { session: false }, async (error) => {
          if (error) return next(error);
          const body = { user_id: user.user_id, email: user.email };
          const token = jwt.sign({ user: body }, JWT_SECRET, {
            expiresIn: '24h',
          });
          res.status(200).json({ message: 'Signin successful', token, body });
        });
      } catch (error) {
        return next(error);
      }
    })(req, res, next);
  }

  /**
   * creates a new user account
   * @param {Request} req - the request object
   * @param {Response} res - the response object
   * @param {NextFunction} next - the next function
   * @returns {Promise<void>} Promise
   */
  static async signup(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    passport.authenticate('signup', async (err: any, user: any, msg: any) => {
      if (err) {
        res.status(403).json({
          msg: 'error creating user',
          reason: 'missing required fields',
        });
        return;
      }
      if (!user) {
        res.status(403).json(msg || { err: 'User already exist' });
        return;
      }
      res.status(201).json({ msg: 'signup successful', user });
    })(req, res, next);
  }
}

export default AuthController;
