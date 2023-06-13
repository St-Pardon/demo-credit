import { CLIENT, DATABASE, PASSWORD, USER } from '../config/env.config';

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
const config = {
  development: {
    client: CLIENT,
    connection: {
      user: USER,
      password: PASSWORD,
      database: DATABASE,
    },
    migrations: {
      directory: '../migrations',
    },
  },
  
  test: {
    client: CLIENT,
    connection: {
      user: USER,
      password: PASSWORD,
      database: 'testdb',
    },
    migrations: {
      directory: './src/migrations',
    },
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: DATABASE,
      user: USER,
      password: PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: '../migrations',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      database: DATABASE,
      user: USER,
      password: PASSWORD,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: '../migrations',
    },
  },
};

export default config as { [key: string]: any };
