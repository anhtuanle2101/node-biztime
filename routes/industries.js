const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');
const db = require('../db');


router.get('/', async (req, res, next)=>{
    try {
        const rs = await db.query(`SELECT i.code as industry_code, i.name, c.code as company_code FROM industries i
        LEFT JOIN companies_industries ci ON i.code = ci.industry_code
        LEFT JOIN companies c ON c.code = ci.company_code`);
        if (rs.rows[0].length===0){
            throw new ExpressError('No industries is found', 400);
        }
        const industries = {};
        rs.rows.forEach(r=> {
            if (industries[r.industry_code])
                industries[r.industry_code].company_codes.push(r.company_code);
            else{
                industries[r.industry_code]={
                    industry_code: r.industry_code,
                    name: r.name,
                    company_codes:[r.company_code]
                }
            }
        })
        return res.status(200).json({industries:Object.keys(industries).map(k=>industries[k])})
    } catch (err) {
        return next(err);
    }
})

module.exports = router;