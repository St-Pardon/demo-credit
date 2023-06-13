import passport from 'passport';
import { v4 as uuidv4 } from 'uuid';
import { Strategy as localStrategy } from 'passport-local';
import {
  ExtractJwt as ExtractJWT,
  Strategy as JWTstrategy,
} from 'passport-jwt';
import { JWT_SECRET } from '../config/env.config';
import database from '../config/db.config';
import { comparePasswords, encryptPassword } from '../utils/hashpassword.utils';
import { Req } from '../utils/types.utils';

passport
  .use(
    new JWTstrategy(
      {
        secretOrKey: JWT_SECRET,
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        jsonWebTokenOptions: {
          maxAge: '24h',
        },
      },
      async (token, done) => {
        try {
          return done(null, token.user);
        } catch (error) {
          return done(error);
        }
      }
    )
  )

  .use(
    'signup',
    new localStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          const data: Req = req.body;
          if (!data.first_name && !data.last_name) {
            return done(true, false, {
              message: 'Please provide all required information',
            });
          }

          const checkMail = await database('users')
            .select('email')
            .where('email', email);

          if (checkMail.length > 0) {
            return done(null, false, { message: 'Email already exist' });
          }

          const user_id: string = uuidv4();
          const hashedPassword = await encryptPassword(password);

          await database('users').insert({
            ...data,
            user_id,
            email,
            password: hashedPassword,
          });
          const user = {
            user_id,
            email,
            first_name: data.first_name,
            last_name: data.last_name,
          };
          return done(null, user);
        } catch (error) {
          return done(error, false, { message: 'error creating user'});
        }
      }
    )
  )

  .use(
    'signin',
    new localStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await database('users')
            .select('*')
            .where('email', email);

          if (!user || user.length < 1) {
            return done(null, false, { message: 'User not found' });
          }

          const validate = await comparePasswords(password, user[0].password);

          if (!validate) {
            return done(true, false, { message: 'Wrong Password' });
          }

          return done(null, user[0], { message: 'Logged in Successfully' });
        } catch (error) {
          return done(error);
        }
      }
    )
  );
