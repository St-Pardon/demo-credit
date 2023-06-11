import knex from 'knex';
import config from '../utils/knexfile';
import { NODE_ENV } from './env.config';

const environment = NODE_ENV;
const connection = knex(config[environment]);
const database = connection;

export default database;
