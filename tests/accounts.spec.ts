import request from 'supertest';
import { clearDatabase, seedDatabase, testDb } from './test-config';
import app from '../src/app';

describe('creation of transaction accounts', () => {
  let token: string;

  beforeAll(async () => {
    // Clear the test database
    await clearDatabase(testDb);

    // Run database migrations
    await testDb.migrate.latest();

    // Seed the test database with sample data
    await seedDatabase(testDb);

    // get auth token
    const res = await request(app)
      .post('/auth/signin')
      .set('content-type', 'application/json')
      .send({
        email: 'john@doe.com',
        password: '12345678',
      });

    token = res.body.token;
  });

  afterAll(async () => {
    // Close the test database connection
    await testDb.destroy();
  });

  it('should create a transaction account', async () => {
    const res = await request(app)
      .get('/account/create')
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + token);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('account_id');
    expect(res.body).toHaveProperty('user_id');
    expect(res.body).toHaveProperty('account_no');
  });

  it('should create current transaction account', async () => {
    const accountType = 'current'; //enum (default: savings, current, fixed deposit)

    const res = await request(app)
      .get(`/account/create?account_type=${accountType}`)
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + token);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('account_id');
    expect(res.body).toHaveProperty('user_id');
    expect(res.body).toHaveProperty('account_no');
    expect(res.body).toHaveProperty('account_type');
    expect(res.body.account_type).toBe(accountType);
  });

  it('should create current transaction account', async () => {
    const accountType = 'fixed deposit'; //enum (default: savings, current, fixed deposit)

    const res = await request(app)
      .get(`/account/create?account_type=${accountType}`)
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + token);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('account_id');
    expect(res.body).toHaveProperty('user_id');
    expect(res.body).toHaveProperty('account_no');
    expect(res.body).toHaveProperty('account_type');
    expect(res.body.account_type).toBe(accountType);
  });

  it('should not create without authorization token', async () => {
    const accountType = 'fixed deposit'; //enum (default: savings, current, fixed deposit)

    const res = await request(app)
      .get(`/account/create?account_type=${accountType}`)
      .set('content-type', 'application/json');

    expect(res.status).toBe(401);
    expect(res.text).toBe('Unauthorized');
  });
});
