import { Router } from 'express';
import UserController from '../controllers/user.controller';

const UserRoute = Router();

UserRoute.get('/', UserController.getInfo)
  .get('/:user_id', UserController.getUser)
  .patch('/', UserController.updateInfo)
  .delete('/', UserController.deleteInfo);

export default UserRoute;
