import knex from 'knex';
import config from '../utils/knexfile';
import { NODE_ENV } from './env.config';

const environment = NODE_ENV;
const database = knex(config[environment]);

export default database;
