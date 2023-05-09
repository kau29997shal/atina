require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const userRouter = require('./routes/userRoutes');
const bodyParser = require('body-parser');
const contactRouter = require('./routes/contactRoutes');
const app = express();
app.use(cors());
app.use(cookieParser());
// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;
//session middleware
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// =================routes=======================
app.get('/', (req, res) => {
    res.json({ message: "ok" });
})

app.use('/user', userRouter)
app.use('/contact', contactRouter)


// =================error handler=============
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });
    return;
});

// =================server connection===============
app.listen('5000', (err) => {
    if(err) return err;
    console.log('server is staetd on port 5000');
})