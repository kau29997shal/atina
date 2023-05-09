const db = require('../services/db');
const helper = require('../helper');
const config = require('../config');
const { dateFun } = require('./user');

const addContact = async (req, user) => {
    const sql =  `INSERT INTO contacts 
    (fullName, address, contactNo, zip, email, created_by, created_at, updated_at) 
    VALUES 
    ("${req.fullName}", "${req.address}", "${req.contactNo}", "${req.zip}", "${req.email}", "${user.id}", "${dateFun()}", "${dateFun()}")`;
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
            message : 'contact created successfully'
        }
    }
  
    return {response};
}

const getContactDetails = async (page = 1) => {
    const offset = helper.getOffset(page, config.listPerPage);
    const rows = await db.query(
        `SELECT * FROM contacts INNER JOIN users ON contacts.created_by = users.id LIMIT ${offset},${config.listPerPage}`
    );
    const data = helper.emptyOrRows(rows);
    const meta = {page};

    return {
        data,
        meta
    }
}


module.exports = {
    addContact,
    getContactDetails
}