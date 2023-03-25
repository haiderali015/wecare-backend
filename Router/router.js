const express = require("express");
const router = new express.Router();
const conn = require("../db/conn");
const bcrypt = require('bcrypt');
var database = require("../db/conn")



// const jwt = require('jsonwebtoken');
// const secret = 'your-secret-key';


// router.post("/create", (req, res) => {
//     console.log(req.body);

//     const { name, cnic, phonenumber, password } = req.body;

//     if (!name || !cnic || !phonenumber || !password) {
//         res.status(422).json("please fill all fields");
//     }

//     try {
//         conn.query("select * from users where cnic =?", cnic, (err, result) => {
//             if (result.length) {
//                 res.status(422).json("This Data is Already Exist")
//             }
//             else {
//                 conn.query("Insert into users SET ?", { name, cnic, phonenumber, password }, (err, result) => {
//                     if (err) {
//                         console.log("error is", err);
//                     }
//                     else {
//                         // Generate a JWT on successful signup
//                         const token = jwt.sign({ userId: result.insertId }, secret, { expiresIn: '1h' });

//                         // Set the JWT as a cookie
//                         res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });

//                         res.status(201).json("User Added");
//                     }
//                 })
//             }
//         })
//     }
//     catch (error) {
//         res.status(422).json(error);
//     }
// });


//register user
router.post("/create", async (req, res) => {
    const { name, cnic, phonenumber, password } = req.body;

    if (!name || !cnic || !phonenumber || !password) {
        res.status(422).json("please fill all fields");
        console.log("iam in if field");
        return;
    }

    try {
        conn.query("SELECT * FROM users WHERE cnic = ?", cnic, (err, result) => {
            if (err) {
                console.log("error checking if user exists:", err);
                res.status(500).json("Internal Server Error");
                return;
            }

            if (result.length) {
                res.status(422).json("This Data is Already Exist");
            } else {
                const saltRounds = 10; // number of salt rounds to use
                const salt = bcrypt.genSaltSync(saltRounds); // generate the salt
                const hashedPassword = bcrypt.hashSync(password, salt);
                conn.query(
                    "INSERT INTO users SET ?",
                    { name, cnic, phonenumber, password: hashedPassword },
                    (err, result) => {
                        if (err) {
                            console.log("error inserting user:", err);
                            res.status(500).json("Internal Server Error");
                            return;
                        }

                        res.status(201).json("User Added");
                    }
                );
            }
        });
    } catch (error) {
        res.status(422).json(error);
    }
});

router.post("/bookdoc", (req, res) => {
    console.log(req.body);
    const { id, userId, bookdate } = req.body;
    // console.log(id);
    try {
        // conn.query("select * from appointments where Id =?", cnic, (err, result) => {
        // if (result.length) {
        // res.status(422).json("This Data is Already Exist")
        // }
        // else {
        conn.query(`Insert into appointments (PatientId,DoctorId,Time) values (${userId},${id},'${new Date(bookdate).toISOString().slice(0, 19).replace('T', ' ')} '+interval '5' hour);`, (err, result) => {
            if (err) {
                console.log("error is", err);
            }
            else {
                res.status(201).json("Booking Added");
            }
        })
        // }
        // }
        // )
    }
    catch (error) {
        res.status(422).json(error);
    }
});


router.get("/appointments/:id", (req, res) => {
    const { id } = req.params;
    conn.query(`SELECT users.id,users.name as patient,appointments.Time FROM wecare.users  inner join appointments on appointments.PatientId=users.id where appointments.DoctorId=${id} `, (err, result) => {
        if (err) {
            res.status(422).json("no data available");
        } else {
            res.status(201).json(result);
        }
    })
});
//
router.post("/slots", (req, res) => {

    const { id } = req.body;
    console.log(id);
    conn.query(`SELECT * from doctor where Id=${id} ;`, (err, result) => {
        if (err) {
            console.log("error is", err);
        }
        else {
            conn.query(`SELECT Time FROM wecare.appointments where DoctorId=${1} AND Time>NOW() `, (error, resl) => {
                if (err) {
                    console.log("error is", err);
                }
                else {
                    console.log("result is", resl);
                    res.status(201).json([result, resl]);
                }
            })
        }
    })
});
// getDoctors
router.get("/getDoctors", (req, res) => {
    // const {city,hospital} = req.params;
    let query = "SELECT * FROM doctor";
    if (req.query.city != 'undefined' && req.query.hospital != 'undefined') {
        query = `SELECT doctor.* FROM doctor inner join hospital on hospital.Location='${req.query.city}' AND hospital.Name='${req.query.hospital}' and hospital.Id=doctor.HospitalId;`;
    }
    else if (req.query.city != 'undefined') {
        query = `SELECT doctor.* FROM doctor inner join hospital on hospital.Location='${req.query.city}' and hospital.Id=doctor.HospitalId;`;
    }
    conn.query(query, (err, result) => {
        if (err) {
            res.status(422).json("no data available");
        } else {
            res.status(201).json(result);
        }
    })
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
router.get("/getMedicines", (req, res) => {

    conn.query("SELECT * FROM pharmacy1", (err, result) => {
        if (err) {
            res.status(422).json("no data available");
        } else {
            res.status(201).json(result);
        }
    })
});

// update Medicines
router.patch("/updateInventory/:id", (req, res) => {

    const { id } = req.params;

    const data = req.body;

    conn.query("UPDATE pharmacy1 SET ? WHERE id = ? ", [data, id], (err, result) => {
        if (err) {
            res.status(422).json({ message: "error" });
        } else {
            res.status(201).json(result);
        }
    })
});

//get single medicine detail
router.get("/induser/:id", (req, res) => {

    const { id } = req.params;

    conn.query("SELECT * FROM pharmacy1 WHERE id = ? ", id, (err, result) => {
        if (err) {
            res.status(422).json("error");
        } else {
            res.status(201).json(result);
        }
    })
});

// update medicine api


router.patch("/updatemedicine/:id", (req, res) => {

    const { id } = req.params;

    const data = req.body;

    conn.query("UPDATE pharmacy1 SET ? WHERE id = ? ", [data, id], (err, result) => {
        if (err) {
            res.status(422).json({ message: "error" });
        } else {
            res.status(201).json(result);
        }
    })
});

// user delete medicine api

router.delete("/deleteuser/:id", (req, res) => {

    const { id } = req.params;

    conn.query("DELETE FROM pharmacy1 WHERE id = ? ", id, (err, result) => {
        if (err) {
            res.status(422).json("error");
        } else {
            res.status(201).json(result);
        }
    })
});

  
  
  
  



// router.post("/login", async (req, res) => {
//     const username = req.body.username;
//     const password = req.body.password;

//     conn.query("select * from users where name= ? and password = ?", [username, password], (error, results) => {
//         if (error) {
//             console.log(error)
//         }
//         else {
//             if (results.length > 0) {
//                 res.send(results)
//             }
//             else {
//                 res.send({ message: "enter correct details" })
//             }

//         }
//     })
// })



// router.post("/login", async (req, res) => {
// const username = req.body.username;
// const password = req.body.password;

// const [rows] = await conn.execute('SELECT password FROM users WHERE name = ?', [username]);

// // check if password matches
// const dbpassword = rows[0].password;
// const isMatch = await bcrypt.compare(password, dbpassword);
// if (isMatch) {
//     res.send(results)
// }
// else {
//     res.send({ message: "enter correct details" })
// }
// })

router.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    conn.query('SELECT * FROM users WHERE name = ?', [username], async (error, results, fields) => {
        if (error) {
            console.log(error);
            res.send({
                "code": 400,
                "failed": "error occurred"
            });
        } else {
            if (results.length > 0) {

                const dbpassword = results[0].password;

                const isMatch = await bcrypt.compare(password, dbpassword);
                if (isMatch) {
                    console.log("success login");

                    res.send({
                        "code": 200,
                        "success": "login successful"
                    });
                } else {
                    console.log("failed login");

                    res.send({
                        "code": 204,
                        "failed": "Username and password do not match"
                    });
                }
            } else {
                console.log("Username does not exist");

                res.send({
                    "code": 204,
                    "failed": "Username does not exist"
                });
            }
        }
    });
});







// update Patients
router.patch("/updatepatient/:id", (req, res) => {

    const { id } = req.params;

    const data = req.body;

    conn.query("UPDATE users SET ? WHERE id = ? ", [data, id], (err, result) => {
        if (err) {
            res.status(422).json({ message: "error" });
        } else {
            res.status(201).json(result);
        }
    })
});

//get single patient detail
router.get("/indusers/:id", (req, res) => {

    const { id } = req.params;

    conn.query("SELECT * FROM users WHERE id = ? ", id, (err, result) => {
        if (err) {
            res.status(422).json("error");
        } else {
            res.status(201).json(result);
        }
    })
});



//show Doctors inventory
router.get("/getAllDoctors", (req, res) => {

    conn.query("SELECT * FROM doctor", (err, result) => {
        if (err) {
            res.status(422).json("no data available");
        } else {
            res.status(201).json(result);
        }
    })
});

router.get("/getAllPatients", (req, res) => {

    conn.query("SELECT * FROM users", (err, result) => {
        if (err) {
            res.status(422).json("no data available");
        } else {
            res.status(201).json(result);
        }
    })
});

//get single doctor

router.get("/indDoctor/:id", (req,res)=>{
    const {id} = req.params
    conn.query("SELECT * FROM doctor WHERE Id = ? ", id, (err, result) => {
        if (err) {
            res.status(422).json("error");
        } else {
            res.status(201).json(result);
        }
    })
});

// update Doctors
router.patch("/updatedoctors/:id", (req, res) => {

    const { id } = req.params;

    const data = req.body;

    conn.query("UPDATE doctor SET ? WHERE Id = ? ", [data, id], (err, result) => {
        if (err) {
            console.log("no patient updated")

            res.status(422).json({ message: "error" });
        } else {
            res.status(201).json(result);
        }
    })
});



router.delete("/deleteDoctor/:id", (req, res) => {

    const { id } = req.params;

    conn.query("DELETE FROM doctor WHERE Id = ? ", id, (err, result) => {
        if (err) {
            res.status(422).json("error");
        } else {
            res.status(201).json(result);
            console.log("deleted")
        }
    })
});

 //add Doctor
router.post("/addnewDoctor", (req, res) => {

    const { username, Experience,degree, Type, HospitalID,password,cnic,city,hospital } = req.body;

    if (!username || !Experience || !degree || !Type || !HospitalID || !password || !cnic || !city || !hospital) {
        res.status(422).json("please fill all fields");
    }

    else {
        conn.query("Insert into doctor SET ?", { username, Experience,degree, Type, HospitalID,password,cnic,city,hospital }, (err, result) => {
            if (err) {
                console.log("error is", err);
            }
            else {
                res.status(201).json("Doctor Added");
            }
        })
    }

});

// user delete api

router.delete("/deletePatient/:id", (req, res) => {

    const { id } = req.params;

    conn.query("DELETE FROM users WHERE id = ? ", id, (err, result) => {
        if (err) {
            res.status(422).json("error");
        } else {
            res.status(201).json(result);
        }
    })
});



module.exports = router;