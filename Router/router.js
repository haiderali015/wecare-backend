const express = require("express");
const router = new express.Router();
const conn = require("../db/conn");
const bodyparser = require("body-parser");
const encoder = bodyparser.urlencoded();


//register user
router.post("/create", (req, res) => {
    console.log(req.body);

    const { name, cnic, phonenumber, password } = req.body;

    if (!name || !cnic || !phonenumber || !password) {
        res.status(422).json("please fill all fields");
    }

    try {
        conn.query("select * from users where cnic =?", cnic, (err, result) => {
            if (result.length) {
                res.status(422).json("This Data is Already Exist")
            }
            else {
                conn.query("Insert into users SET ?", { name, cnic, phonenumber, password }, (err, result) => {
                    if (err) {
                        console.log("error is", err);
                    }
                    else {
                        res.status(201).json("User Added");
                    }
                })
            }
        })
    }
    catch (error) {
        res.status(422).json(error);
    }
});





//add medicine
router.post("/addMedicine", (req, res) => {
    console.log(req.body);

    const { name, mg, type, quantity } = req.body;

    if (!name || !mg || !type || !quantity) {
        res.status(422).json("please fill all fields");
    }

    else {
        conn.query("Insert into pharmacy1 SET ?", { name, mg, type, quantity }, (err, result) => {
            if (err) {
                console.log("error is", err);
            }
            else {
                res.status(201).json("Medicine Added");
            }
        })
    }
    
});


//show medicine inventory
router.get("/getMedicines",(req,res)=>{

    conn.query("SELECT * FROM pharmacy1",(err,result)=>{
        if(err){
            res.status(422).json("no data available");
        }else{
            res.status(201).json(result);
        }
    })
});

// update Medicines
router.patch("/updateInventory/:id",(req,res)=>{

    const {id} = req.params;

    const data = req.body;

    conn.query("UPDATE pharmacy1 SET ? WHERE id = ? ",[data,id],(err,result)=>{
        if(err){
            res.status(422).json({message:"error"});
        }else{
            res.status(201).json(result);
        }
    })
});

//get single medicine detail
router.get("/induser/:id",(req,res)=>{

    const {id} = req.params;

    conn.query("SELECT * FROM pharmacy1 WHERE id = ? ",id,(err,result)=>{
        if(err){
            res.status(422).json("error");
        }else{
            res.status(201).json(result);
        }
    })
});

// update medicine api


router.patch("/updatemedicine/:id",(req,res)=>{

    const {id} = req.params;

    const data = req.body;

    conn.query("UPDATE pharmacy1 SET ? WHERE id = ? ",[data,id],(err,result)=>{
        if(err){
            res.status(422).json({message:"error"});
        }else{
            res.status(201).json(result);
        }
    })
});

// user delete medicine api

router.delete("/deleteuser/:id",(req,res)=>{

    const {id} = req.params;

    conn.query("DELETE FROM pharmacy1 WHERE id = ? ",id,(err,result)=>{
        if(err){
            res.status(422).json("error");
        }else{
            res.status(201).json(result);
        }
    })
});


//patient siginin

router.post("/login",(req,res)=>{
    const username= req.body.username;
    const password= req.body.password;
    conn.query("select * from users where name= ? and password = ?",[username,password] ,(error,results)=>{
        if(error)
        {
            console.log(error)
        }
        else{
            if(results.length>0)
            {
            res.send(results)            }
            else{
            res.send({message: "enter correct details"})
            }
   
        }
    })
})




module.exports=router;