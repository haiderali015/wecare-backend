const express = require("express");
const app= express();
const mysql = require("mysql2");
const cors = require("cors");
const router = require("./Router/router");
require("./db/conn");
const port=8001;

// app.get("/",(req,res)=>{
//     res.send("server starts")
// });

//middleware
app.use(express.json());
app.use(cors());
app.use(router);


app.listen(port,()=>{
    console.log("server starts at port " + port)
})
