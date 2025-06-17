import test from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from '../server.js';

const request = supertest(app);

test('GET /api/stations returns stations', async () => {
  const res = await request.get('/api/stations');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length > 0);
});

test('GET /api/search requires params', async () => {
  const res = await request.get('/api/search');
  assert.equal(res.status, 400);
});
