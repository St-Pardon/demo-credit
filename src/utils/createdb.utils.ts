import knex from "knex";
import { CLIENT, PASSWORD, USER } from "../config/env.config";

const knexConfig = {
    client: CLIENT,
    connection: {
      host: 'localhost',
      user: USER,
      password: PASSWORD,
    },
  };

const database  = knex(knexConfig);

async function createDatabase() {
    try {
      await database.raw('CREATE DATABASE IF NOT EXISTS dcredit');
      console.log('Database created successfully.');
    } catch (error) {
      console.error('Error creating database:', error);
    } finally {
      database.destroy();
    }
  }
  
  createDatabase();