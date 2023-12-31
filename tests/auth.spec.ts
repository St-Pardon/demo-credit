import request from 'supertest';
import { clearDatabase, createDatabase, seedDatabase, testDb } from './test-config';
import app from '../src/app';
import { encryptPassword } from '../src/utils/hashpassword.utils';

describe('Authenticate User', () => {
  beforeAll(async () => {
    // Create database
    await createDatabase()

    // Clear the test database
    await clearDatabase(testDb);

    // Run database migrations
    await testDb.migrate.latest();

    // Seed the test database with sample data
    await seedDatabase(testDb);
  });

  afterAll(async () => {
    // Close the test database connection
    await testDb.raw('DROP DATABASE testdb');
    await testDb.client.destroy();
  });

  it('should Signin a user', async () => {
    const res = await request(app)
      .post('/auth/signin')
      .set('content-type', 'application/json')
      .send({
        email: 'john@doe.com',
        password: '12345678',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body).toHaveProperty('token');
    expect(res.body.message).toBe('Signin successful');
    expect(res.body.body).toHaveProperty('user_id');
    expect(res.body.body).toHaveProperty('email');
    expect(res.body.body.email).toBe('john@doe.com');
  });

  it("shouldn't Signin a user with wrong email", async () => {
    const res = await request(app)
      .post('/auth/signin')
      .set('content-type', 'application/json')
      .send({
        email: 'john1@doe.com',
        password: '12345678',
      });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('User do not exist');
  });

  it("shouldn't Signin a user with wrong password", async () => {
    const res = await request(app)
      .post('/auth/signin')
      .set('content-type', 'application/json')
      .send({
        email: 'john@doe.com',
        password: '125678',
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Email or password is incorrect');
  });

  it('should SignUp a user', async () => {
    const res = await request(app)
      .post('/auth/signup')
      .set('content-type', 'application/json')
      .send({
        first_name: 'steve',
        last_name: 'gerald',
        email: 'steve@gerald.com',
        password: await encryptPassword('stevegerald'),
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('msg');
    expect(res.body).toHaveProperty('user');
    expect(res.body.msg).toBe('signup successful');
    expect(res.body.user).toHaveProperty('user_id');
    expect(res.body.user).toHaveProperty('email');
    expect(res.body.user).toHaveProperty('first_name');
    expect(res.body.user).toHaveProperty('last_name');
    expect(res.body.user.email).toBe('steve@gerald.com');
    expect(res.body.user.first_name).toBe('steve');
    expect(res.body.user.last_name).toBe('gerald');
  });

  it("shouldn't SignUp a user without any field", async () => {
    const res = await request(app)
      .post('/auth/signup')
      .set('content-type', 'application/json')
      .send({
        first_name: 'steve',
        last_name: 'gerald',
        password: await encryptPassword('stevegerald'),
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Missing credentials');
  });

  it("shouldn't SignUp a user without an email", async () => {
    const res = await request(app)
      .post('/auth/signup')
      .set('content-type', 'application/json')
      .send({
        first_name: 'steve',
        last_name: 'gerald',
        password: await encryptPassword('stevegerald'),
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Missing credentials');
  });

  it("shouldn't SignUp a user without a password", async () => {
    const res = await request(app)
      .post('/auth/signup')
      .set('content-type', 'application/json')
      .send({
        first_name: 'steve',
        last_name: 'gerald',
        password: await encryptPassword('stevegerald'),
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message');
    expect(res.body.message).toBe('Missing credentials');
  });

  it("shouldn't SignUp a user without a first name", async () => {
    const res = await request(app)
      .post('/auth/signup')
      .set('content-type', 'application/json')
      .send({
        last_name: 'gerald',
        email: 'steve1@gerald.com',
        password: await encryptPassword('stevegerald'),
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('msg');
    expect(res.body).toHaveProperty('reason');
    expect(res.body.msg).toBe('error creating user');
    expect(res.body.reason).toBe('missing required fields');
  });

  it("shouldn't SignUp a user without a last name", async () => {
    const res = await request(app)
      .post('/auth/signup')
      .set('content-type', 'application/json')
      .send({
        first_name: 'steve',
        email: 'steve1@gerald.com',
        password: await encryptPassword('stevegerald'),
      });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('msg');
    expect(res.body).toHaveProperty('reason');
    expect(res.body.msg).toBe('error creating user');
    expect(res.body.reason).toBe('missing required fields');
  });
});
