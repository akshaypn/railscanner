import test from 'node:test';
import assert from 'node:assert/strict';
import supertest from 'supertest';
import app from '../server.js';

const request = supertest(app);

function mockFetch(data) {
  return () => Promise.resolve({ ok: true, json: () => Promise.resolve(data) });
}

test('GET /api/train/:number returns train info', async () => {
  const original = global.fetch;
  global.fetch = mockFetch({ train: 'info' });
  const res = await request.get('/api/train/12051');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { train: 'info' });
  global.fetch = original;
});

test('GET /api/status/:number requires date', async () => {
  const res = await request.get('/api/status/12051');
  assert.equal(res.status, 400);
});

test('GET /api/status/:number returns status', async () => {
  const original = global.fetch;
  global.fetch = mockFetch({ status: 'on time' });
  const res = await request.get('/api/status/12051?date=20240623');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { status: 'on time' });
  global.fetch = original;
});
