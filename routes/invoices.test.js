process.env.NODE_ENV = 'test';

const request= require('supertest');
const app = require('../app');
const db = require('../db');

let testInvoice;

beforeEach(async ()=>{
    const addCompany = await db.query(`INSERT INTO companies (code, name, description)
    VALUES ('AMA', 'Amazon', 'Amazon Primes'),
    ('APL', 'Apple', 'Inventor of Iphones'),
    ('MIC', 'Microsoft', 'Father of Windows')`)
    const result = await db.query(`INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
    VALUES ('AMA', '350.50', true,'2021-07-01', '2021-01-01') RETURNING *`);
    testInvoice = result.rows[0];
})

afterEach(async ()=>{
    let result = await db.query(`DELETE FROM invoices`);
    result = await db.query(`DELETE FROM companies`);
})

afterAll(async ()=>{
    await db.end();
})


describe("GET /invoices", ()=>{
    test("Get list of invoices", async ()=>{
        const res = await request(app).get('/invoices');
        expect(res.status).toBe(200);
        expect(res.body.invoices[0]).toEqual(testInvoice);
    })
})

describe("GET /invoices/:id", ()=>{
    test("Gets a single invoice", async()=>{
        const res = await request(app).get(`/invoices/${testInvoice.id}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({invoice: testInvoice})
    })
    test("Responds with 404 for invalid id", async()=>{
        const res = await request(app).get('/invoices/123');
        expect(res.status).toBe(404);
    })
})

describe("POST /invoices", ()=>{
    test("Creates a new invoice", async()=>{
        const res = await request(app).post('/invoices').send({comp_code:"APL", amt:500.25, paid:false, add_date:'2021-06-24', paid_date:'2021-01-01'});
        expect(res.status).toBe(201);
        expect(res.body).toEqual({
            invoice:{
                comp_code:"APL", 
                amt:500.25, 
                paid: false, 
                add_date: expect.any(String), 
                paid_date: expect.any(String),
                id: expect.any(Number)
            }
        })
    })
})

// PATCH /users/:id
describe("PATCH /invoices", ()=>{
    test("Updates a single invoice", async()=>{
        const res = await request(app).patch(`/invoices/${testInvoice.id}`).send({comp_code:"MIC", amt:500.25, paid:false, add_date:'2021-06-24', paid_date:'2021-01-01'});
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            invoice:{
                comp_code:"MIC", 
                amt:500.25, 
                paid:false, 
                add_date: expect.any(String), 
                paid_date: expect.any(String), 
                id: expect.any(Number)
            }
        })
    })
    test("Responds with 400 with invalid id", async()=>{
        const res = await request(app).patch(`/invoices/123`).send({name: 'Billy', type: 'admin'});
        expect(res.status).toBe(404);
    })
})

describe("DELETE /users/:id", ()=>{
    test("Delete a user", async()=>{
        const res = await request(app).delete(`/invoices/${testInvoice.id}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            msg: "DELETED!"
        })
    })
})