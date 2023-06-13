import request from 'supertest';
import { clearDatabase, seedDatabase, testDb } from './test-config';
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
    // Clear the test database
    await clearDatabase(testDb);

    // Run database migrations
    await testDb.migrate.latest();

    // Seed the test database with sample data
    await seedDatabase(testDb);

    // get auth token for 3 users
    // user 1
    // const res1 = await request(app)
    //   .post('/auth/signin')
    //   .set('content-type', 'application/json')
    //   .send({
    //     email: 'john@doe.com',
    //     password: '12345678',
    //   });
    // token = res1.body.token;
    // const account1 = await request(app)
    //   .get('/account/user-accounts')
    //   .set('content-type', 'application/json')
    //   .set('authorization', 'Bearer ' + res1.body.token);

    // user1 = {
    //   token: await res1.body.token,
    //   account_no: parseInt(await account1.body.account_no),
    // };

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
    console.log(user2.account_no, res2.body.user_id);
    // user 3
    //     const res3 = await request(app)
    //       .post('/auth/signin')
    //       .set('content-type', 'application/json')
    //       .send({
    //         email: 'tim@crook.com',
    //         password: '12345678',
    //       });

    //     const account3 = await request(app)
    //       .get('/account/create')
    //       .set('content-type', 'application/json')
    //       .set('authorization', 'Bearer ' + res3.body.token);

    //     user3 = {
    //       token: await res3.body.token,
    //       account_no: parseInt(await account3.body.account_no),
    //     };
    // console.log(user1);
  });

  afterAll(async () => {
    // Close the test database connection
    await testDb.destroy();
  });

  //   it('should not fund an account without deposit information', async () => {
  //     const res = await request(app)
  //       .put('/account/fund')
  //       .set('content-type', 'application/json')
  //       .set('authorization', 'Bearer ' + user1.token);

  //     expect(res.status).toBe(400);
  //     expect(res.body).toHaveProperty('msg');
  //     expect(res.body.msg).toBe('Deposit Failed');
  //   });

  it('should fund an account with deposit information', async () => {
    // const res1 = await request(app)
    //   .post('/auth/signin')
    //   .set('content-type', 'application/json')
    //   .send({
    //     email: 'john@doe.com',
    //     password: '12345678',
    //   });
    // token = res1.body.token;
    // const res = await request(app)
    //   .get('/account/create')
    //   .set('content-type', 'application/json')
    //   .set('authorization', 'Bearer ' + token);
    console.log(user2.account_no);
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
    // expect(res.body).toHaveProperty('msg');
    // expect(res.body).toHaveProperty('transaction_id');
    // expect(res.body.msg).toBe('Deposit Successful');
  });

  //   it("Authenticated user should not deposit into another user's account", async () => {
  //     const res = await request(app)
  //       .put('/account/fund')
  //       .set('content-type', 'application/json')
  //       .set('authorization', 'Bearer ' + user1.token)
  //       .send({
  //         amount: 25000.5,
  //         account_no: 637656,
  //         comment: 'salary deposit',
  //       });

  //     expect(res.status).toBe(400);
  //     expect(res.body).toHaveProperty('msg');
  //     expect(res.body).toHaveProperty('transaction_id');
  //     expect(res.body.msg).toBe('Deposit Successful');
  //   });

  //   it('should not fund without authorization token', async () => {
  //     const res = await request(app)
  //       .put(`/account/fund`)
  //       .set('content-type', 'application/json');

  //     expect(res.status).toBe(401);
  //     expect(res.text).toBe('Unauthorized');
  //   });
});
