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

  // 7. AI Service Status Endpoint (Practical 13)
  test('GET /api/ai/status returns 200 with AI provider configuration', async () => {
    const res = await request(app).get('/api/ai/status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('enabled', true);
    expect(res.body).toHaveProperty('provider');
    expect(res.body).toHaveProperty('gracefulDegradation');
  });

  // 8. AI Description Generation with Graceful Degradation (Practical 13)
  test('POST /api/ai/generate-description returns 200 with description and disclaimer', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .send({
        title: 'Configure JWT Auth and Bcrypt Hashing'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('description');
    expect(typeof res.body.description).toBe('string');
    expect(res.body.description.length).toBeGreaterThan(10);
    expect(res.body).toHaveProperty('disclaimer');
    expect(res.body).toHaveProperty('suggestedPriority');
  });

  // 9. AI Description Validation - Empty Title (Negative Test)
  test('POST /api/ai/generate-description without title returns 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: '' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Validation Error');
  });

  // 10. AI Rate Limiting (Supplementary Problem: max 1 per task per minute)
  test('POST /api/ai/generate-description triggers 429 on rapid repeat request for same title', async () => {
    // Unique title to avoid collision with test 8
    const repeatTitle = 'Setup Docker Compose Multi-Container Orchestration ' + Date.now();
    
    // First call succeeds (200)
    const firstRes = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: repeatTitle });
    expect(firstRes.statusCode).toBe(200);

    // Second call immediately for the same title triggers rate limit (429)
    const secondRes = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: repeatTitle });
    expect(secondRes.statusCode).toBe(429);
    expect(secondRes.body).toHaveProperty('error', 'Rate Limit Exceeded');
  });

  afterAll(async () => {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
  });
});

