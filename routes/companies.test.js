process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;

beforeEach(async ()=>{
    const res = await db.query(`INSERT INTO companies (code, name, description)
    VALUES ('APL', 'Apple', 'Founder of iPhones') RETURNING *`);
    testCompany = res.rows[0];
})

afterEach(async ()=>{
    await db.query(`DELETE FROM companies`);
})

afterAll(async ()=>{
    await db.end();
})

describe('Test GET routes', ()=>{
    test('Get all companies', async ()=>{
        const res = await request(app).get('/companies');

        expect(res.status).toEqual(200);
        expect(res.body).toEqual({companies:[testCompany]});
    })
    test('Get a single company', async ()=>{
        const res = await request(app).get(`/companies/${testCompany.code}`);

        expect(res.status).toEqual(200);
        expect(res.body).toEqual({company: testCompany});
    })
})

describe('Test POST routes', ()=>{
    test('Create a new company', async ()=>{
        const res = await request(app).post('/companies').send({code: 'MIC', name: 'Microsoft', description: 'Founder of Windows'});

        expect(res.status).toEqual(201);
        expect(res.body).toEqual({company:{
            code:'MIC',
            name:'Microsoft',
            description:'Founder of Windows'
        }})
    })
})

