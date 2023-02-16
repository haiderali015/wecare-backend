const mysql = require("mysql2");

const conn = mysql.createConnection({
    user : "root",
    host : "localhost",
    password : "password",
    database : "wecare"
});

conn.connect((err)=>{
    if (err)
    {
        console.log(err);
    }
    else
    {
        console.log("DB connected");
    }
})

module.exports=conn;