const request = require('supertest');
const app = require('../server');

describe('Full-Stack Task Management API Test Suite (Practical 12 CI/CD)', () => {
  let authToken = '';

  // 1. Health and Database Status Endpoint
  test('GET /api/db-status returns 200 and connectivity details', async () => {
    const res = await request(app).get('/api/db-status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('connected');
    expect(res.body).toHaveProperty('authMode');
  });

  // 2. Unauthenticated Task Access (Security check)
  test('GET /tasks without JWT token returns 401 Unauthorized', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  // 3. User Authentication Endpoint
  test('POST /login with valid credentials returns 200 and signed JWT token', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'daksh@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.user).toHaveProperty('email', 'daksh@example.com');
    authToken = res.body.token;
  });

  // 4. Authenticated Task Read
  test('GET /tasks with valid Bearer token returns 200 and task array', async () => {
    // If login passed, use token; otherwise authenticate
    if (!authToken) {
      const loginRes = await request(app)
        .post('/login')
        .send({ email: 'daksh@example.com', password: 'password123' });
      authToken = loginRes.body.token;
    }

    const res = await request(app)
      .get('/tasks')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 5. In-Memory Cache Stats Endpoint (Practical 9)
  test('GET /api/cache-stats returns 200 with hit/miss counters', async () => {
    const res = await request(app).get('/api/cache-stats');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('hits');
    expect(res.body).toHaveProperty('misses');
    expect(res.body).toHaveProperty('engine', 'node-cache (in-memory)');
  });

  // 6. Asynchronous Event-Driven Logs Endpoint (Practical 10)
  test('GET /api/event-logs returns 200 with background audit trail', async () => {
    const res = await request(app).get('/api/event-logs');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('total');
    expect(Array.isArray(res.body.events)).toBe(true);
  });

  afterAll(async () => {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
  });
});

