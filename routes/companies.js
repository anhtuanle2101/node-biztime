const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');
const db = require('../db');

router.get('/', async (req, res, next)=>{
    try {
        const rs = await db.query(`SELECT * FROM companies`);
        return res.json({companies: rs.rows});
    } catch (e) {
        return next(e);
    }
})

router.get('/:code', async (req, res, next)=>{
    try {
        const {code} = req.params;
        const rs = await db.query(`SELECT c.code AS company_code, c.name, c.description, i.code AS industry_code FROM companies c
        LEFT JOIN companies_industries ci ON c.code = ci.company_code
        LEFT JOIN industries i ON i.code = ci.industry_code 
        WHERE c.code = $1`, [code]);
        if (rs.rows.length === 0){
            throw new ExpressError(`The company with code ${code} couldn't be found`, 404);
        }
        const {company_code, name, description} = rs.rows[0];
        const industries = rs.rows.map(r=>r.industry_code);
        return res.status(200).json({company:{
            company_code, 
            name,
            description,
            industries
        }})
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next)=>{
    try {
        const {code, name, description} = req.body;
        if (!!code && !!name && !!description){
            const rs = await db.query(`INSERT INTO companies
            VALUES ($1, $2, $3)
            RETURNING *`,[code, name, description])
            return res.status(201).json({company: rs.rows[0]})
        }else{
            throw new ExpressError("code, name, and description fields are required", 400);
        }
    } catch (e) {
        return next(e);
    }
})

router.patch('/:code_in', async (req, res, next)=>{
    try {
        const {code_in} = req.params;
        const {code, name, description} = req.body;
        const rs = await db.query(`UPDATE companies
        SET code = $1, name = $2, description = $3
        WHERE code = $4
        RETURNING *`,[code, name, description, code_in])
        if (rs.rows.length === 0){
            throw new ExpressError(`The company with code ${code_in} couldn't be found`,404);
        }
        return res.json({company: rs.rows[0]})
    } catch (e) {
        return next(e);
    }
})

router.delete('/:code', async (req, res, next)=>{
    try {
        const {code} = req.params;
        const rs = await db.query(`DELETE FROM companies 
        WHERE code = $1 RETURNING *`,[code]);
        if (rs.rows.length === 0){
            throw new ExpressError(`The company with code ${code_in} couldn't be found`,404);
        }
        return res.json({msg:'Deleted!'});
    } catch (e) {
        return next(e);
    }
})


module.exports = router;