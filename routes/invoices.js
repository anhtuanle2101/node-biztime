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
        const {comp_code, amt, paid, add_date, paid_date} = req.body;
        
        const rs = await db.query(`INSERT INTO invoices
        (comp_code, amt, paid, add_date, paid_date)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,[comp_code, amt, paid, add_date, paid_date])

        return res.status(201).json({invoice: rs.rows[0]})
    } catch (e) {
        return next(e);
    }
})

router.patch('/:id', async (req, res, next)=>{
    try {
        const {id} = req.params;
        const {amt, paid} = req.body;
        let paid_date = null;
        const invoice = await db.query(`SELECT paid, paid_date FROM invoices WHERE id = $1`, [id]);
        if (invoice.rows.length === 0){
            throw new ExpressError(`The invoice with id ${id} couldn't be found`,404);
        }
        if (paid === true && amt > 0){
            paid_date = new Date();
        }else if (paid === false){
            paid_date = null;
        }else{
            paid_date = invoice.rows[0].paid_date;
        }
        const rs = await db.query(`UPDATE invoices
        SET amt = $1, paid = $2, paid_date = $3
        WHERE id = $4
        RETURNING *`,[amt, paid, paid_date, id])
        return res.json({invoice: rs.rows[0]})
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
        return res.json({msg:'DELETED!'});
    } catch (e) {
        return next(e);
    }
})


module.exports = router;