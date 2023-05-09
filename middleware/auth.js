const jwt = require("jsonwebtoken");
const config = process.env;

const verifyToken = (req, res, next) => {
    try {
        const session = req.session;
        console.log(session.token);
        if(session.token != undefined){
            const decoded = jwt.verify(session.token, config.TOKEN_KEY);
            req.user = decoded;
        }else{
            res.json({
                error : true,
                message : "Please login",
                login : true
            });
        }
    } catch (err) {
        res.json({
            error : true,
            message : "Invalid Token",
            login : true
        });
    }
    return next();
};

module.exports = verifyToken;