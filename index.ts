import App from './src/app';
import database from './src/config/db.config';
import { PORT } from './src/config/env.config';

// check if database is connected
database
  .raw('SELECT 1')
  .then(() => {
    console.log('Database connection successful');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });

App.listen(PORT, () => {
  console.log(`Server running at https://127.0.0.1:${PORT}`);
});
