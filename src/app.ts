import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import IndexRoute from './routes/index.route';
import './middleware/passport.middleware';

const App: Application = express();

App.use(express.json())
  .use(express.urlencoded({ extended: false }))
  .use(helmet())
  .use(IndexRoute);

export default App;
