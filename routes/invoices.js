const express = require('express');
const router = express.Router();
const ExpressError = require('../expressError');
const db = require('../db');

router.get('/', async (req, res, next)=>{
    try {
        const rs = await db.query(`SELECT * FROM invoices`);
        return res.json({invoices: rs.rows});
    } catch (e) {
        return next(e);
    }
})

router.get('/:id', async (req, res, next)=>{
    try {
        const {id} = req.params;
        const rs = await db.query(`SELECT * FROM invoices
        WHERE id = $1`, [id]);
        if (rs.rows.length === 0){
            throw new ExpressError(`The invoice with id ${id} couldn't be found`, 404);
        }
        return res.json({invoice: rs.rows[0]})
    } catch (e) {
        return next(e);
    }
})

router.post('/', async (req, res, next)=>{
    try {
        const {id, comp_code, amt, paid, add_date, paid_date} = req.body;
        
        const rs = await db.query(`INSERT INTO invoices
        (id, comp_code, amt, paid, add_date, paid_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,[id, comp_code, amt, paid, add_date, paid_date])

        return res.json({invoice: rs.rows[0]})
    } catch (e) {
        return next(e);
    }
})

router.patch('/:id', async (req, res, next)=>{
    try {
        const {id} = req.params;
        const {comp_code, amt, paid, add_date, paid_date} = req.body;
        const rs = await db.query(`UPDATE invoices
        SET comp_code=$1, amt=$2, paid=$3, add_date=$4, paid_date=$5
        WHERE id = $6
        RETURNING *`,[comp_code, amt, paid, add_date, paid_date, id])
        if (rs.rows.length === 0){
            throw new ExpressError(`The invoice with id ${id} couldn't be found`,404);
        }
        return res.json({company: rs.rows[0]})
    } catch (e) {
        return next(e);
    }
})

router.delete('/:id', async (req, res, next)=>{
    try {
        const {id} = req.params;
        const rs = await db.query(`DELETE FROM invoices 
        WHERE id = $1 RETURNING *`,[id]);
        if (rs.rows.length === 0){
            throw new ExpressError(`The invoice with id ${id} couldn't be found`,404);
        }
        return res.json({msg:'Deleted!'});
    } catch (e) {
        return next(e);
    }
})


module.exports = router;