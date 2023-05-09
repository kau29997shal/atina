const express = require('express');
const verifyToken = require('../middleware/auth');
const { addContact, getContactDetails } = require('../controller/contact');
const contactRouter = express.Router();

// ===============add user==============
contactRouter.post('/add', verifyToken, async (req, res, next) => {
    try {
        res.json(await addContact(req.body, req.user));
    } catch (err) {
        console.error(`Error while creating contact `, err.message);
        next(err);
    }
});

// =========users list============
contactRouter.get('/', verifyToken, async (req, res, next) => {
    try {
        res.json(await getContactDetails(req.query.page));
    } catch (err) {
        console.error(`Error while getting contacts `, err.message);
        next(err);
    }
});

module.exports = contactRouter;