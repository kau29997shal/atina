const express = require('express');
const { getMultiple, addUser, loginUser, changePassword, forgetPassword, resetPassword } = require('../controller/user');
const verifyToken = require('../middleware/auth');
const userRouter = express.Router();


// ===============login user==============
userRouter.post('/login', async (req, res, next) => {
    try {
        var session = req.session
        res.json(await loginUser(req.body, session));
    } catch (err) {
        console.error(`Error while login user `, err.message);
        next(err);
    }
});

// ================logout user=========
userRouter.get('/logout', verifyToken, async (req,res) => {
    await req.session.destroy();
    res.json({
        error : false,
        message : 'logout successfully'
    })
});

// ===============add user==============
userRouter.post('/add', async (req, res, next) => {
    try {
        res.json(await addUser(req.body));
    } catch (err) {
        console.error(`Error while creating users `, err.message);
        next(err);
    }
});

// =========users list============
userRouter.get('/', verifyToken, async (req, res, next) => {
    try {
        res.json(await getMultiple(req.query.page));
    } catch (err) {
        console.error(`Error while getting users `, err.message);
        next(err);
    }
});

// ===============change password==============
userRouter.post('/updatePassword', verifyToken, async (req, res, next) => {
    try {
        var session = req.session
        res.json(await changePassword(req.body, req.user, session));
    } catch (err) {
        console.error(`Error while creating users `, err.message);
        next(err);
    }
});

// ===============forget password==============
userRouter.post('/forgetPassword', async (req, res, next) => {
    try {
        res.json(await forgetPassword(req.body));
    } catch (err) {
        console.error(`Error while forgetting password `, err.message);
        next(err);
    }
});

// ===============reset password==============
userRouter.post('/resetPassword', async (req, res, next) => {
    try {
        res.json(await resetPassword(req.body));
    } catch (err) {
        console.error(`Error while resetting password `, err.message);
        next(err);
    }
});



module.exports = userRouter;