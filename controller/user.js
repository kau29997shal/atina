const db = require('../services/db');
const helper = require('../helper');
const config = require('../config');
const jwt = require('jsonwebtoken');

const dateFun = () => {
    var date = new Date();
    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    return dateString;
}

function generate(n) {
    var add = 1, max = 12 - add;   
    // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.   
    
    if ( n > max ) {
        return generate(max) + generate(n - max);
    }
    
    max        = Math.pow(10, n+add);
    var min    = max/10; // Math.pow(10, n) basically
    var number = Math.floor( Math.random() * (max - min + 1) ) + min;
    
    return ("" + number).substring(add); 
}

const loginUser = async (req, session) => {
    try {
        const { userName, password } = req;
        if (userName && password){
            const selUser = `SELECT * FROM users WHERE userName = "${userName}" AND password = "${password}"`;
            const user = await db.query(
                selUser
            );
            const userData = helper.emptyOrRows(user);
            if (userData != null && userData.length > 0) {
                const {id, userName, password, firstName, lastName} = userData[0];
                // Create token
                const token = jwt.sign(
                    {id, userName, password, firstName, lastName},
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "24h",
                    }
                );
                session.token = token;
                const updateQuery = `UPDATE users SET token="${token}", updated_at= "${dateFun()}" WHERE id = ${id}`;
                const updateUser = await db.query(updateQuery);
                const updatedUser = await db.query(
                    `SELECT * FROM users WHERE id = ${id}`
                );
                const updatedUserData = helper.emptyOrRows(updatedUser);
                return {
                   error : false,
                   message : "User logged in successfully",
                   user : updatedUserData[0]
                };
            }else{
                return {
                    error : true,
                    message : "Invalid Credentials"
                }
            }
        }else{
            return {
                error : true,
                message : "All input is required"
            }
        }
    } catch (error) {
        console.log(error);
        return {
            error : true,
            messgae : 'something went wrong'
        }
    }
}

const getMultiple = async (page = 1) => {
    const offset = helper.getOffset(page, config.listPerPage);
    const rows = await db.query(
        `SELECT * FROM users LIMIT ${offset},${config.listPerPage}`
    );
    const data = helper.emptyOrRows(rows);
    const meta = {page};

    return {
        data,
        meta
    }
}

const addUser = async (req) => {
    var date = new Date();
    var dateString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000 )).toISOString().split("T")[0];
    const sql =  `INSERT INTO users 
    (firstName, lastName, userName, password, email, phone, created_at, updated_at) 
    VALUES 
    ("${req.firstName}", "${req.lastName}", "${req.userName}", "${req.password}", "${req.email}", "${req.phone}", "${dateFun()}", "${dateFun()}")`;
    console.log(sql);
    const result = await db.query(
       sql
    );
  
    let response = {
        error : true,
        message : 'Error in creating user'
    }
  
    if (result.affectedRows) {
        response = {
            error : true,
            message : 'User created successfully'
        }
    }
  
    return {response};
}

const changePassword = async (req, user, session) => {
    const { oldPassword, newPassword, cnfrmPassword } = req;
    if(oldPassword && newPassword && cnfrmPassword){
        const {id, userName, password, firstName, lastName} = user;
        if(oldPassword === password){
            if(newPassword === cnfrmPassword){
                // Create token
                const token = jwt.sign(
                    {id, userName, newPassword, firstName, lastName},
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "24h",
                    }
                );
                session.token = token;
                const updateQuery = `UPDATE users SET token="${token}", password="${newPassword}", updated_at= "${dateFun()}" WHERE id = ${id}`;
                const updateUser = await db.query(updateQuery);
                const updatedUser = await db.query(
                    `SELECT * FROM users WHERE id = ${id}`
                );
                const updatedUserData = helper.emptyOrRows(updatedUser);
                return {
                    error : false,
                    message : 'password updated successfully',
                    user : updatedUserData[0]
                }
            }
        }else{
            return {
                error : true,
                message : 'please input correct old password'
            }
        }
    }else{
        return {
            error : true,
            message : 'All inputs are required'
        }
    }
}

const forgetPassword = async (req) => {
    const resetToken = parseInt(generate(6));
    const {userName} = req;
    if(userName){
        const selUser = `SELECT * FROM users WHERE userName = "${userName}"`;
        console.log(selUser);
        const user = await db.query(
            selUser
        );
        const userData = helper.emptyOrRows(user);
        if (userData != null && userData.length > 0) {
            const updateQuery = `UPDATE users SET resetToken="${resetToken}", updated_at= "${dateFun()}" WHERE userName = "${userName}"`;
            const updateUser = await db.query(updateQuery);
            return {
                error : false,
                message : `Your reset password token is ${resetToken}`
            }
        }else{
            return {
                error : true,
                message : "User name not found"
            }
        }
    }else{
        return {
            error : true,
            message : `user name required`
        }
    }
}

const resetPassword = async (req) => {
    const { userName, resetToken, newPassword, cnfrmPassword } = req;
    if(resetToken && newPassword && cnfrmPassword){
        const selUser = `SELECT * FROM users WHERE userName = "${userName}" AND resetToken = ${resetToken}`;
        console.log(selUser);
        const user = await db.query(
            selUser
        );
        const userData = helper.emptyOrRows(user);
        if(userData != null && userData.length > 0){
            const {id} = userData[0];
            if(newPassword === cnfrmPassword){
                const updateQuery = `UPDATE users SET resetToken = 0, password="${newPassword}", updated_at= "${dateFun()}" WHERE id = ${id}`;
                const updateUser = await db.query(updateQuery);
                const updatedUser = await db.query(
                    `SELECT * FROM users WHERE id = ${id}`
                );
                const updatedUserData = helper.emptyOrRows(updatedUser);
                return {
                    error : false,
                    message : 'password updated successfully',
                    user : updatedUserData[0]
                }
            }else{
                return {
                    error : true,
                    message : 'new password and confirm password should be same'
                }
            }
        }else{
            return {
                error : true,
                message : 'Please enter valid token'
            }
        }
    }else{
        return {
            error : true,
            message : 'All inputs are required'
        }
    }
}

module.exports = {
    getMultiple,
    addUser,
    loginUser,
    changePassword,
    dateFun,
    forgetPassword,
    resetPassword
}