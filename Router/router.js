const express = require("express");
const router = new express.Router();
const conn = require("../db/conn");
const bcrypt = require('bcrypt');
var database = require("../db/conn")


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

router.post("/medicinesrecord", async (req, res) => {
    const { name, cnic, address, medicinename, quantity, total ,PName, PAddress,date} = req.body;
  
    if (!name || !cnic || !address || !medicinename || !quantity || !total || !PName || !PAddress) {
      res.status(422).json("please fill all fields");
      console.log("iam in if field");
      return;
    }
  
    conn.query(
      "INSERT INTO medicinerecord1 (name, cnic, address, medicine, quantity, total,pharmacyName,pharmacyAddress,date) VALUES (?, ?, ?, ?, ?, ?,?,?,?)",
      [name, cnic, address, medicinename, quantity, total,PName, PAddress,date],
      (err, result) => {
        if (err) {
          console.log("error inserting record:", err);
          res.status(500).json("Internal Server Error");
          return;
        }
  
        conn.query(
          "UPDATE pharmacy1 SET quantity = quantity - ? WHERE name = ?",
          [quantity, medicinename],
          (err, result) => {
            if (err) {
              console.log("error updating inventory:", err);
              res.status(500).json("Internal Server Error");
              return;
            }
  
            res.status(201).json("Record Added");
          }
        );
      }
    );
  });
  
router.post("/bookdoc", (req, res) => {
    console.log(req.body);
    const { id, userId, bookdate ,Doctor_Name , doctorFee , doctor_hospital} = req.body;
    console.log("doctor name is "+ Doctor_Name);
    try {
        conn.query(`Insert into appointments (PatientId,DoctorId,Time,DoctorName,DoctorFee,Hospital) values (${userId},${id},'${new Date(bookdate).toISOString().slice(0, 19).replace('T', ' ')} '+interval '5' hour,'${Doctor_Name}','${doctorFee}','${doctor_hospital}');`, (err, result) => {
            if (err) {
                console.log("error is", err);
            }
            else {
                res.status(201).json("Booking Added");
            }
        })
    }
    catch (error) {
        res.status(422).json(error);
    }
});




router.get("/appointments/:id", (req, res) => {
    const { id } = req.params;
    conn.query(`SELECT users.id,users.name as patient,appointments.Time,appointments.Id as appointment_id FROM wecare.users  inner join appointments on appointments.PatientId=users.id where appointments.DoctorId=${id} and appointments.id NOT IN (SELECT appointment_id FROM checkup) `, (err, result) => {
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
            conn.query(`SELECT Time FROM wecare.appointments where DoctorId=${id} `, (error, resl) => {
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
        query = `SELECT * FROM doctor WHERE city='${req.query.city}' AND hospital='${req.query.hospital}';`;
    }
    else if (req.query.city != 'undefined') {
        query = `SELECT * FROM doctor WHERE city='${req.query.city}' ;`;
    }
    else if(req.query.hospital != 'undefined')
    {
        query = `SELECT * FROM doctor WHERE hospital='${req.query.hospital}';`;
    }
    console.log(query);
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


// show all pharmacies
router.get("/getAllPharmacies", (req, res) => {

    conn.query("SELECT * FROM pharmacylist", (err, result) => {
        if (err) {
            res.status(422).json("no data available");
        } else {
            res.status(201).json(result);
        }
    })
});

//add pharmacy
router.post("/addnewPharmacy", (req, res) => {

    const { name, address, city, password, phonenumber } = req.body;

    if (!name || !address || !city || !password || !phonenumber ) {
        res.status(422).json("please fill all fields");
    }

    else {
        conn.query("Insert into pharmacylist SET ?", { name, address, city, password, phonenumber }, (err, result) => {
            if (err) {
                console.log("error is", err);
            }
            else {
                res.status(201).json("Pharmacy Added");
            }
        })
    }

});


// pharmacy delete  api

router.delete("/deletepharmacy/:id", (req, res) => {

    const { id } = req.params;

    conn.query("DELETE FROM pharmacylist WHERE id = ? ", id, (err, result) => {
        if (err) {
            res.status(422).json("error");
        } else {
            res.status(201).json(result);
        }
    })
});
 
//get single medicine detail
router.get("/inPharmacy/:id", (req, res) => {

    const { id } = req.params;

    conn.query("SELECT * FROM pharmacylist WHERE id = ? ", id, (err, result) => {
        if (err) {
            res.status(422).json("error");
        } else {
            res.status(201).json(result);
        }
    })
});

// update PharmacyList api


router.patch("/updatePharmacylist/:id", (req, res) => {

    const { id } = req.params;

    const data = req.body;

    conn.query("UPDATE pharmacylist SET ? WHERE id = ? ", [data, id], (err, result) => {
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

router.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const jwt = require('jsonwebtoken');
    const secretKey = 'wecare';




    conn.query('SELECT * FROM users WHERE name = ?', [username], async (error, results, fields) => {
        if (error) {
            console.log(error);
            res.send({
                "code": 400,
                "failed": "error occurred"
            });
        } else {
            if (results.length > 0) {

                // Create a JWT token with a payload and secret key
                const payload = {
                    userId: results[0].id,
                    username: results[0].name,
                    password: results[0].password,


                };
                // const options = {
                //     expiresIn: '1h'
                // };
                const token = jwt.sign(payload, secretKey);
            
                const dbpassword = results[0].password;

                const isMatch = await bcrypt.compare(password, dbpassword);
                if (isMatch) {
                    console.log("success login");

                    res.send({
                        "code": 200,
                        "success": "login successful",
                        token:token,
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


// doctor signin
router.post("/loginDoctor", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const jwt = require('jsonwebtoken');
    const secretKey = 'wecare';

    conn.query('SELECT * FROM doctor WHERE username = ?', [username], async (error, results, fields) => {
        if (error) {
            console.log(error);
            res.send({
                "code": 400,
                "failed": "error occurred"
            });
        } else {
            if (results.length > 0) {

                // Create a JWT token with a payload and secret key
                const payload = {
                    doctorID: results[0].Id,
                    username: results[0].username,
                    password: results[0].password

                };
                const token = jwt.sign(payload, secretKey);
            
                // const dbpassword = results[0].password;

                // const isMatch = await bcrypt.compare(password, dbpassword);
                if (password) {
                    console.log("success login");

                    res.send({
                        "code": 200,
                        "success": "login successful",
                        token:token,
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




// pharmacy signin
router.post("/loginPharmacy", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const jwt = require('jsonwebtoken');
    const secretKey = 'wecare';

    conn.query('SELECT * FROM pharmacylist WHERE name = ?', [username], async (error, results, fields) => {
        if (error) {
            console.log(error);
            res.send({
                "code": 400,
                "failed": "error occurred"
            });
        } else {
            if (results.length > 0) {

                // Create a JWT token with a payload and secret key
                const payload = {
                    phramacyID: results[0].id,
                    name: results[0].name,
                    address:results[0].address,
                    city:results[0].city,
                    phonenumber:results[0].phonenumber,
                    password: results[0].password,

                };

                const token = jwt.sign(payload, secretKey);
            
                // const dbpassword = results[0].password;

                // const isMatch = await bcrypt.compare(password, dbpassword);
                if (password) {
                    console.log("success login");

                    res.send({
                        "code": 200,
                        "success": "login successful",
                        token:token,
                    });
                } else {
                    console.log("failed login");

                    res.send({
                        "code": 204,
                        "failed": "name and password do not match"
                    });
                }
            } else {
                console.log("name does not exist");

                res.send({
                    "code": 204,
                    "failed": "name does not exist"
                });
            }
        }
    });
});


//get patient prescription for pharmacy
router.post("/getprescpharmacy", async (req, res) => {
    const PID = req.body.UserID;
    const date = req.body.Time;   
    
    console.log(PID, date);
    conn.query('SELECT * FROM checkup WHERE UserID = ?', [PID], async (error, results, fields) => {
        if (error) {
            console.log(error);
            res.send({
                "code": 400,
                "failed": "error occurred"
            });
        } else {
            if (results.length > 0) {

                if (date) {
                    console.log("success login");

                    res.send({
                        "code": 200,
                        "success": "login successful",
                    });
                }else {
                    console.log("failed login");

                    res.send({
                        "code": 204,
                        "failed": "PID and Date do not match"
                    });
                }
            } else {
                console.log("PID does not exist");

                res.send({
                    "code": 204,
                    "failed": "PID does not exist"
                });
            }
        }
    });
});

//get patient prescription for phrmcy
router.get("/getprescriptiondown/:id", (req, res) => {
    console.log("get patien prescriptoin")
    const { id } = req.params
    conn.query("SELECT * FROM checkup WHERE Id = ? ", id, (err, result) => {
        if (err) {
            res.status(422).json("error");
        } else {
            res.status(201).json(result);
        }
    })
});


// update Patients
router.patch("/updatepatient/:id", (req, res) => {

    const { id } = req.params;

    const data = req.body;
    console.log(req.body);

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

router.get("/indDoctor/:id", (req, res) => {
    const { id } = req.params
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

    const { username, Experience, degree, Type, HospitalID, password, cnic, city, hospital } = req.body;

    if (!username || !Experience || !degree || !Type || !HospitalID || !password || !cnic || !city || !hospital) {
        res.status(422).json("please fill all fields");
    }

    else {
        conn.query("Insert into doctor SET ?", { username, Experience, degree, Type, HospitalID, password, cnic, city, hospital }, (err, result) => {
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

// new Apis
router.post('/doctor_records/:id', (req, res) => {
    let { appointment_id, Diagnosis, Allergies, Medicines, Notes, DoctorId, UserId } = req.body;
    const newRecord = { appointment_id, Diagnosis, Allergies, Medicines: JSON.stringify(Medicines), Notes, DoctorId, UserId };
    console.log(newRecord);
    conn.query('Insert into checkup (appointment_id,Diagnosis,Allergies,Medicines,Notes,DoctorId,UserId) VALUES  (?,?,?,?,?,?,?) ', [appointment_id, Diagnosis, Allergies, JSON.stringify(Medicines), Notes, DoctorId, UserId], (err, result) => {
        if (err) {
            throw err;
        }
        res.send('Record created successfully');
    });
});

router.get('/doctor_records', (req, res) => {
    conn.query('SELECT * FROM doctor_records', (err, results) => {
        if (err) {
            throw err;
        }
        res.json(results);
    });
});


//get patient single patient
router.get("/getpatient/:id", (req, res) => {
    const { id } = req.params
    conn.query("SELECT * FROM users WHERE Id = ? ", id, (err, result) => {
        if (err) {
            res.status(422).json("error");
        } else {
            res.status(201).json(result);
        }
    })
});


//get patient prescription
router.get("/getprescription/:id", (req, res) => {
    console.log("get patien prescriptoin")
    // const { id } = req.params
    const id = 2;
    conn.query("SELECT * FROM checkup WHERE appointment_id = ? ", id, (err, result) => {
        if (err) {
            res.status(422).json("error");
        } else {
            res.status(201).json(result);
        }
    })
});








//show all appointments
router.get("/getAllAppointments/:id", (req, res) => {
    const { id } = req.params;

    conn.query("SELECT * FROM appointments WHERE PatientId = ? ", [id],  (err, result) => {
        if (err) {
            res.status(422).json("no data available");
        } else {
            res.status(201).json(result);
        }
    })
});

// show all medicines record
router.get("/getMedicineRecord/:name", (req, res) => {
    const { name } = req.params;
    
    conn.query("SELECT * FROM medicinerecord1 WHERE name = ?", [name], (err, result) => {
      if (err) {
        res.status(422).json("no data available");
      } else {
        res.status(201).json(result);
      }
    });
  });
  

router.get("/getAppointment/:id", (req, res) => {
    const { id } = req.params;
  
    const query = `SELECT appointments.DoctorName, appointments.Hospital, appointments.DoctorFee, checkup.Medicines, checkup.Diagnosis
                   FROM appointments
                   JOIN checkup ON appointments.Id = checkup.appointment_id
                   WHERE appointments.PatientId = ?`;
  
    conn.query(query, id, (err, result) => {
      if (err) {
        console.error(err);
        res.status(422).json("no data available");
      } else {
        console.log(result);
        res.status(201).json(result);
      }
    });
  });


  router.get("/getAppointment/:id", (req, res) => {
    const { id } = req.params;
  
    const query = `SELECT appointments.DoctorName, appointments.Hospital, appointments.DoctorFee, checkup.Medicines, checkup.Diagnosis
                   FROM appointments
                   JOIN checkup ON appointments.Id = checkup.appointment_id
                   WHERE appointments.PatientId = ?`;
  
    conn.query(query, id, (err, result) => {
      if (err) {
        console.error(err);
        res.status(422).json("no data available");
      } else {
        console.log(result);
        res.status(201).json(result);
      }
    });
  });

  
  //changepassword
router.post("/changepassword", async (req, res) => {
    const { id } = req.params;
    const {password } = req.body;

    if (!password) {
        res.status(422).json("please fill all fields");
        console.log("iam in if field");
        return;
    }

    try {
        conn.query("SELECT * FROM users WHERE id = ?", [id], (err, result) => {
            if (err) {
                console.log("error checking if user exists:", err);
                res.status(500).json("Internal Server Error");
                return;
            }

            console.log("password is "+ password)
                const saltRounds = 10; // number of salt rounds to use
                const salt = bcrypt.genSaltSync(saltRounds); // generate the salt
                const hashedPassword = bcrypt.hashSync(password, salt);
                conn.query(
                    "Update users SET ?",
                    { password: hashedPassword },
                    (err, result) => {
                        if (err) {
                            console.log("error inserting user:", err);
                            res.status(500).json("Internal Server Error");
                            return;
                        }

                        res.status(201).json("Password Updated");
                    }
                );
            
        });
    } catch (error) {
        res.status(422).json(error);
    }
});

  

module.exports = router;