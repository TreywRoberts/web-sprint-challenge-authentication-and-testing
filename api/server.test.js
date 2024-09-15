const server = require('./server')
const db = require('./../data/dbConfig')
const request = require('supertest')

// Write your tests here
beforeAll(async () => {
  await db.migrate.rollback()
  await db.migrate.latest()
})
beforeEach(async () => {
  await db('users').truncate()
})
afterAll(async () => {
  await db.destroy()
})
it('sanity test', ()=>{
  expect(true).not.toBe(false)
})
it('process.env.DB_ENV must be "testing"', () => {
  expect(process.env.NODE_ENV).toBe('testing')
})

describe('[POST] auth-router login end points', ()=>{
  it('response with the right message for valid credentials', async ()=>{
    await request(server).post('/api/auth/register').send({username: 'trey', password: '1234'})
    const res = await request(server).post('/api/auth/login').send({ username: 'trey', password: '1234' })
    expect(res.body.message).toMatch(/welcome, trey/i)
  })
  it('responds with the correct status and message on invalid credentials', async () => {
    await request(server).post('/api/auth/register').send({username: 'trey', password: '1234'})
    let res = await request(server).post('/api/auth/login').send({ username: 'trey', password: '1234' })
    expect(res.body.message).toMatch(/welcome, trey/i)
    res = await request(server).post('/api/auth/login').send({ username: 'bobsy', password: '1234' })
    expect(res.body.message).toMatch(/invalid credentials/i)
    expect(res.status).toBe(401)
    res = await request(server).post('/api/auth/login').send({ username: 'bob', password: '12345' })
    expect(res.body.message).toMatch(/invalid credentials/i)
    expect(res.status).toBe(401)
  })
})

describe('[POST] Auth-router register endpoints', ()=>{
    it('registers a new user', async ()=>{
      await request(server).post('/api/auth/register').send({username:'trey', password:'1234'})
      const trey = await db('users').where('username', 'trey').first()
      expect(trey).toMatchObject({ username: 'trey' })
    })
    it('responses with the correct message if username is missing', async ()=>{
    const res = await request(server).post('/api/auth/register').send({ password:'1234'})
    expect(res.body.message).toMatch(/username and password required/i)
    })
})

describe('[GET] jokes router', ()=>{
  it('requests without a token are bounced with proper status and message', async () => {
    const res = await request(server).get('/api/jokes')
    expect(res.body.message).toMatch(/token required/i)
  })
  it('requests with an invalid token are bounced with proper status and message', async () => {
    const res = await request(server).get('/api/jokes').set('Authorization', 'foobar')
    expect(res.body.message).toMatch(/token invalid/i)
  })
})
