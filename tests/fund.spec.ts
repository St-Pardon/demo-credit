import request from 'supertest';
import {
  clearDatabase,
  createDatabase,
  seedDatabase,
  testDb,
} from './test-config';
import app from '../src/app';

describe('Test basic transactions, deposit, transfer and fund account', () => {
  type user = {
    account_no?: number;
    token: string;
  };
  let user1: user;
  let user2: user;
  let user3: user;
  let token: string;
  beforeAll(async () => {
    // Create database
    await createDatabase();

    // Clear the test database
    await clearDatabase(testDb);

    // Run database migrations
    await testDb.migrate.latest();

    // Seed the test database with sample data
    await seedDatabase(testDb);

    // get auth token for 3 users
    // user 1
    const res1 = await request(app)
      .post('/auth/signin')
      .set('content-type', 'application/json')
      .send({
        email: 'john@doe.com',
        password: '12345678',
      });

    const account1 = await request(app)
      .get('/account/user-accounts')
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + res1.body.token);

    user1 = {
      token: await res1.body.token,
      account_no: parseInt(await account1.body[0].account_no),
    };

    // user2
    const res2 = await request(app)
      .post('/auth/signin')
      .set('content-type', 'application/json')
      .send({
        email: 'thor@odinson.com',
        password: '12345678',
      });

    const account2 = await request(app)
      .get('/account/user-accounts')
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + res2.body.token);

    user2 = {
      token: await res2.body.token,
      account_no: parseInt(await account2.body[0].account_no),
    };

    //user 3
    const res3 = await request(app)
      .post('/auth/signin')
      .set('content-type', 'application/json')
      .send({
        email: 'tim@crook.com',
        password: '12345678',
      });

    const account3 = await request(app)
      .get('/account/user-accounts')
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + res3.body.token);

    user3 = {
      token: await res3.body.token,
      account_no: parseInt(await account3.body[0].account_no),
    };
  });

  afterAll(async () => {
    // Close the test database connection
    await testDb.raw('DROP DATABASE testdb');
    await testDb.client.destroy();
  });

  /**
   * Deposit Endpoint Tests
   */
  it("Authenticated user should not deposit into another user's account", async () => {
    const res = await request(app)
      .put('/account/fund')
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + user1.token)
      .send({
        amount: 100000.5,
        account_no: user2.account_no,
        comment: 'salary deposit',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('err');
    expect(res.body).toHaveProperty('reason');
    expect(res.body.err).toBe('Invalid account number');
    expect(res.body.reason).toBe('account do not exist or belong to this user');
  });

  it('should deposit fund an account with deposit information', async () => {
    const res = await request(app)
      .put('/account/fund')
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + user2.token)
      .send({
        amount: 100000.5,
        account_no: user2.account_no,
        comment: 'salary deposit',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('msg');
    expect(res.body).toHaveProperty('transaction_id');
    expect(res.body.msg).toBe('Deposit Successful');
  });

  it('should not deposit fund user with account information', async () => {
    const res = await request(app)
      .put(`/account/fund`)
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + user1.token)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('err');
    expect(res.body.err).toBe('Provided amount and account information');
  });

  it('should not deposit fund without authorization token', async () => {
    const res = await request(app)
      .put(`/account/fund`)
      .set('content-type', 'application/json');

    expect(res.status).toBe(401);
    expect(res.text).toBe('Unauthorized');
  });

  /**
   * withdrawal endpoints tests
   */
  it("Authenticated user should not withdraw into another user's account", async () => {
    const res = await request(app)
      .put('/account/withdraw')
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + user1.token)
      .send({
        amount: 100000.5,
        account_no: user2.account_no,
        comment: 'salary deposit',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('err');
    expect(res.body).toHaveProperty('reason');
    expect(res.body.err).toBe('Invalid account number');
    expect(res.body.reason).toBe('account do not exist or belong to this user');
  });

  it('should withdraw fund an account with deposit information', async () => {
    const res = await request(app)
      .put('/account/withdraw')
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + user2.token)
      .send({
        amount: 100000.5,
        account_no: user2.account_no,
        comment: 'transport',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('msg');
    expect(res.body).toHaveProperty('transaction_id');
    expect(res.body.msg).toBe('Withdrawal Successful');
  });

  it('should not withdraw fund for user without account information', async () => {
    const res = await request(app)
      .put(`/account/withdraw`)
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + user1.token)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('err');
    expect(res.body.err).toBe('Provided amount and account information');
  });

  it('should not deposit fund without authorization token', async () => {
    const res = await request(app)
      .put(`/account/withdraw`)
      .set('content-type', 'application/json');

    expect(res.status).toBe(401);
    expect(res.text).toBe('Unauthorized');
  });

  /**
   * Balance, user accounts and info endpoints tests
   */

  // Balance
  it('should not get balance for user without account information', async () => {
    const res = await request(app)
      .get(`/account/balance`)
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + user1.token);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('err');
    expect(res.body.err).toBe('Provided account information');
  });

  it('should get balance for user with account information', async () => {
    const res = await request(app)
      .get(`/account/balance?account_no=${user1.account_no}`)
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + user1.token);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('balance');
  });

  it('should not get another user account balance', async () => {
    const res = await request(app)
      .get(`/account/balance?account_no=${user1.account_no}`)
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + user2.token);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('err');
    expect(res.body.err).toBe(
      'Cannot get balance for this account, Try again later'
    );
  });

  it('should not get balance for unauthenticated user', async () => {
    const res = await request(app)
      .get(`/account/balance?account_no=${user1.account_no}`)
      .set('content-type', 'application/json');

    expect(res.status).toBe(401);
    expect(res.text).toBe('Unauthorized');
  });

  // Account Information
  it('should not get account information for user without account information', async () => {
    const res = await request(app)
      .get(`/account/account-info`)
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + user1.token);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('err');
    expect(res.body.err).toBe('Provided account information');
  });

  it('should get account information for user with account information', async () => {
    const res = await request(app)
      .get(`/account/account-info?account_no=${user1.account_no}`)
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + user1.token);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('balance');
    expect(res.body).toHaveProperty('account_id');
    expect(res.body).toHaveProperty('account_type');
    expect(res.body).toHaveProperty('user_id');
  });

  it('should not get another user account information', async () => {
    const res = await request(app)
      .get(`/account/account-info?account_no=${user1.account_no}`)
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + user2.token);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('err');
    expect(res.body).toHaveProperty('reason');
    expect(res.body.err).toBe('Invalid account number');
    expect(res.body.reason).toBe('account do not exist or belong to this user');
  });

  it('should not get account information for unauthenticated user', async () => {
    const res = await request(app)
      .get(`/account/account-info?account_no=${user1.account_no}`)
      .set('content-type', 'application/json');

    expect(res.status).toBe(401);
    expect(res.text).toBe('Unauthorized');
  });

  // User accounts
  it("should get all users account with the account's information", async () => {
    const res = await request(app)
      .get(`/account/user-accounts`)
      .set('content-type', 'application/json')
      .set('authorization', 'Bearer ' + user1.token);

    expect(res.status).toBe(200);
    expect(typeof res.body).toBe('object');
  });

  it('should not get accounts for unauthenticated user', async () => {
    const res = await request(app)
      .get(`/account/user-accounts`)
      .set('content-type', 'application/json');

    expect(res.status).toBe(401);
    expect(res.text).toBe('Unauthorized');
  });
});
