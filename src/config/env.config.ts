import dotenv from 'dotenv';
dotenv.config();

export const PORT: string = process.env.PORT || '5000';

// database config
export const CLIENT: string = process.env.CLIENT || 'mysql2';
export const USER: string = process.env.DB_USER || 'root';
export const PASSWORD: string = process.env.PASSWORD || '';
export const DATABASE: string = process.env.DATABASE || 'dcredit';
export const NODE_ENV: string = process.env.NODE_ENV || 'development';

// Auth Config
export const JWT_SECRET: string = process.env.JWT_SECRET || '';
