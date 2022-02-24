const db = require('../data/db-config');
const Shoungs = require('./shoungs/shoung-model');
const request = require('supertest');
const server = require('./server');

beforeAll(async () => {
    await db.migrate.rollback()
    await db.migrate.latest();
});

beforeEach(async () => {
    await db('shoungs').truncate();
});

test('verify we are using the correct environment', () => {
    expect(process.env.NODE_ENV).toBe('testing')
});

describe('test server endpoint', () => {
    test('verify the "/" endpoint', async () => {
        const result = await request(server).get('/');
        expect(result.status).toBe(200);
        expect(result.body).toEqual({ api: 'up' });
    });

    test('[GET] /api/shoungs', async () => {
        let result = await request(server).get('/api/shoungs');
        expect(result.status).toBe(200);
        expect(result.body).toBeInstanceOf(Array);
        expect(result.body).toHaveLength(0);
    });

    test('[GET] /api/shoungs/:id', async () => {
       let result = await Shoungs.insert({ name: 'coco', age: 5 });
       result = await request(server).get('/api/shoungs/' + result.id);
       expect(result.body.name).toBe('coco');
       expect(result.body.age).toBe(5);
    });

    test('[POST] /api/shoungs', async () => {
        let result = await request(server)
            .post('/api/shoungs')
            .send({ name: 'coco', age: 5 })
        expect(result.status).toBe(201);

        result = await Shoungs.getById(1);
        expect(result.name).toBe('coco');
        expect(result.age).toBe(5);
    });

    test('[PUT] /api/shoungs/:id', async () => {
        let {id} = await Shoungs.insert({ name: 'coco', age: 5 });
        let result = await request(server)
            .put('/api/shoungs/' + id)
            .send({ name: 'cat', age: 10 });
        expect(result.body).toEqual({ name: 'cat', age: 10, id });
        let shoung = await Shoungs.getById(id);
        expect(shoung).toEqual({ name: 'cat', age: 10, id });
    });

    test('[DELETE] /api/shoungs/:id', async () => {
        let {id} = await Shoungs.insert({ name: 'coco', age: 5 });
        let result = await request(server).delete('/api/shoungs/' + id);
        expect(result.status).toEqual(200);
        expect(result.body).toEqual({ name: 'coco', age: 5, id: 1 });
        const shoungs = await db('shoungs');
        expect(shoungs).toHaveLength(0);
    });
});
