const express = require("express");
const { urlencoded } = require("express");
const app= express();
// const mysql = require("mysql2");
const cors = require("cors");
const router = require("./Router/router");

// var session = require("express-session");
// require("./db/conn");
const port=8001;

// app.get("/",(req,res)=>{
//     res.send("server starts")
// });

//middleware
app.use(urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.use(router);

// app.use(session({
// secret:"webslesson",
// resave:true,
// saveUninitialized:true
// }))


app.listen(port,()=>{
    console.log("server starts at port " + port)
})
