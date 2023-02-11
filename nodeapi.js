const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')

const app = express()
const port = process.env.PORT || 5000;


app.use(express.urlencoded({ extended: true }));

app.use(express.json());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: null,
    database: "NodeTest"
})


// Api Routes
app.post('/api/otp_verify', (req, res) => otpVerify(req, res))
app.post('/api/getAllUsers', (req, res) => getAllUsers(req, res))
app.post('/api/postUser', (req, res) => postUser(req, res))
app.post('/api/get_profile', (req, res) => get_profile(req, res))
app.post('/api/update_profile', (req, res) => update_profile(req, res))
app.post('/api/login', (req, res) => login(req, res))
app.post('/api/signup', (req, res) => signup(req, res))
app.post('/api/resend_otp', (req, res) => resendOtp(req, res))
app.post('/api/form_data_test', (req, res) => formData(req, res))


// Apis
function formData(req, res) {
    console.log(req)
    pool.getConnection((err, connection) => {
        if (err) {
            connection.release()
            res.send(JSON.stringify({
                "result": "false",
                "msg": err
            }));
        }

        res.header('Content-Type', 'text/json')

        res.send(req)

    })
}

function signup(req, res) {
    console.log(req.body)
    pool.getConnection((err, connection) => {
        if (err) {
            connection.release()
            res.send(JSON.stringify({
                "result": "false",
                "msg": err
            }));
        }

        res.header('Content-Type', 'text/json')

        // if (req.body && req.body.length > 0) {
        const mobile = req.body.mobile;
        var password = req.body.password;


        if (mobile && password && mobile.length > 0 && password.length > 0) {
            connection.query('SELECT * FROM user WHERE mobile = ?', mobile, (er, data) => {
                if (!er) {
                    if (data && data.length > 0) {
                        res.send(JSON.stringify({
                            "result": "false",
                            "msg": "Mobile Number Already Exists!"
                        }));
                    } else {
                        var name = req.body.name;
                        var email = req.body.email;
                        var bio = req.body.bio;
                        var pincode = req.body.pincode;
                        var address = req.body.address;
                        var lat = req.body.lat;
                        var lang = req.body.lang;

                        if (!name || name.length == 0) name = ""
                        if (!email || email.length == 0) email = ""
                        if (!bio || bio.length == 0) bio = ""
                        if (!pincode || pincode.length == 0) pincode = ""
                        if (!address || address.length == 0) address = ""
                        if (!lat || lat.length == 0) lat = ""
                        if (!lang || lang.length == 0) lang = ""
                        let otp = Math.floor(1000 + Math.random() * 9000);


                        user = {
                            "name": name,
                            "mobile": mobile,
                            "password": password,
                            "email": email,
                            "bio": bio,
                            "pincode": pincode,
                            "address": address,
                            "lat": lat,
                            "lang": lang,
                            "otp": otp
                        }

                        connection.query('Insert into user Set ?', user, (er, result) => {
                            if (!er) {
                                res.send(JSON.stringify({
                                    "result": "true",
                                    "msg": "Signup Successfull!",
                                    "data": user
                                }));
                            } else {
                                res.send(JSON.stringify({
                                    "result": "false",
                                    "msg": er
                                }));
                            }
                        })
                    }
                } else {
                    res.send(JSON.stringify({
                        "result": "false",
                        "msg": er
                    }));
                }

            })
        } else {
            res.send(JSON.stringify({
                "result": "false",
                "msg": "Parameter Required. mobile, password, Optional(name, email, bio, pincode, address, lat, lang)!"
            }));
        }
        // }
        //  else {
        //     res.send(JSON.stringify({
        //         "result": "false",
        //         "msg": "Parameter Required. mobile, password, Optional(name, email, bio, pincode, address, lat, lang)"
        //     }));
        // }
    })
}

function login(data, res) {
    res.header('Content-Type', 'text/json')

    pool.getConnection((err, connection) => {
        if (err) {
            connection.release()
            res.send(JSON.stringify({
                "result": "false",
                "msg": err
            }));
        }

        var phone = data.body.phone
        var password = data.body.password

        if (phone && phone.length > 0 && password && password.length > 0) {

            connection.query('SELECT * FROM user Where mobile = ?', phone, (err, rows) => {
                // connection.release() // return the connection to pool
                if (!err) {
                    if (rows && rows.length > 0) {
                        if (rows[0].password == password) {
                            let otp = Math.floor(1000 + Math.random() * 9000);
                            rows[0].otp = otp.toString();

                            var data = [rows[0].otp, rows[0].user_id];
                            connection.query('Update user Set otp = ? Where user_id = ?', data, (err, result) => {
                                connection.release()
                                if (!err) {
                                    res.send(JSON.stringify({
                                        "result": "true",
                                        "msg": "Login Successfull",
                                        "data": rows[0]
                                    }));
                                } else {
                                    res.send(JSON.stringify({
                                        "result": "false",
                                        "msg": err
                                    }));
                                }
                            });
                        } else {
                            res.send(JSON.stringify({
                                "result": "false",
                                "msg": "Incorrect Password!"
                            }));
                        }
                    } else {
                        res.send(JSON.stringify({
                            "result": "false",
                            "msg": "Number not registered!"
                        }));
                    }
                } else {
                    res.send(JSON.stringify({
                        "result": "false",
                        "msg": err
                    }));
                }
            })
        } else {
            res.send(JSON.stringify({
                "result": "false",
                "msg": "Parameter Required phone, password"
            }));
        }
    })
}

function update_profile(req, res) {
    console.log(req.body)
    pool.getConnection((err, connection) => {
        if (err) {
            connection.release()
            res.send(JSON.stringify({
                "result": "false",
                "msg": err
            }));
        }

        res.header('Content-Type', 'text/json')

        const id = req.body.id

        if (id) {
            connection.query('SELECT * FROM userinfo where id = ?', id, (err, result) => {
                if (!err) {

                    if (result && result.length > 0) {
                        var name = req.body.name;
                        var age = req.body.age;
                        var job = req.body.job;

                        if (name) result[0].name = name
                        if (age) result[0].age = age
                        if (job) result[0].job = job

                        const final = [result[0].name, result[0].age, result[0].job, id]

                        connection.query('UPDATE userinfo SET name = ?, age = ?, job = ? WHERE id = ?', final, (er, response) => {
                            connection.release();
                            console.log(response);
                            if (!er) {
                                res.send(JSON.stringify({
                                    "result": "true",
                                    "msg": "Profile Successfully Updated!"
                                }));
                            } else {
                                res.send(JSON.stringify({
                                    "result": "false",
                                    "msg": er
                                }));
                            }
                        })

                    } else {
                        res.send(JSON.stringify({
                            "result": "false",
                            "msg": "User Not Found!"
                        }));
                    }

                } else {
                    res.send(JSON.stringify({
                        "result": "false",
                        "msg": err
                    }));
                }
            })
        } else {
            res.send(JSON.stringify({
                "result": "false",
                "msg": "Parameter Required id, Optional (name, age, job)"
            }));
        }
    })
}

function get_profile(req, res) {
    console.log(req.body)
    pool.getConnection((err, connection) => {
        if (err) {
            connection.release()
            res.send(JSON.stringify({
                "result": "false",
                "msg": err
            }));
        }


        var id = req.body.id

        if (id) {
            connection.query('SELECT * FROM userinfo where id = ?', id, (err, result) => {
                connection.release() // return the connection to pool
                if (!err) {
                    // res.send(rows)
                    res.header('Content-Type', 'text/json')
                    if (result && result.length > 0) {
                        res.send(JSON.stringify({
                            "result": "true",
                            "msg": "Successfully Got the data",
                            "data": result[0]
                        }));
                    } else {
                        res.send(JSON.stringify({
                            "result": "false",
                            "msg": "No Data Found"
                        }));
                    }
                } else {
                    console.log(err)
                }

            })
        } else {
            res.send(JSON.stringify({
                "result": "false",
                "msg": "Parameter Required id"
            }));
        }
    })
}

function postUser(req, res) {
    console.log(req.body)
    pool.getConnection((err, connection) => {
        if (err) {
            connection.release()
            res.send(JSON.stringify({
                "result": "false",
                "msg": err
            }));
        }

        const data = req.body

        connection.query('Insert into userinfo Set ?', data, (err, rows) => {
            connection.release() // return the connection to pool
            if (!err) {
                // res.send(rows)
                res.header('Content-Type', 'text/json')
                res.send(JSON.stringify({
                    "result": "true",
                    "msg": "Data Successfully Inserted"
                }));
            } else {
                console.log(err)
            }

        })
    })
}

function getAllUsers(req, res) {
    console.log(req)
    pool.getConnection((err, connection) => {
        if (err) {
            connection.release()
            res.send(JSON.stringify({
                "result": "false",
                "msg": err
            }));
        }


        connection.query('SELECT * FROM user', (err, rows) => {
            connection.release() // return the connection to pool
            if (!err) {
                // res.send(rows)
                res.header('Content-Type', 'text/json')
                res.send(JSON.stringify({
                    "result": "true",
                    "msg": "Successfully Got the data",
                    "data": rows
                }));
            } else {
                console.log(err)
            }

        })
    })
}

function otpVerify(req, res) {
    pool.getConnection((err, connection) => {
        if (err) {
            connection.release()
            res.send(JSON.stringify({
                "result": "false",
                "msg": err
            }));
        }
        res.header('Content-Type', 'text/json')

        var user_id = req.body.user_id;
        var otp = req.body.otp;

        if (user_id && user_id.length > 0) {
            if (otp && otp.length > 0) {

                connection.query('SELECT * FROM user Where user_id = ?', user_id, (err, rows) => {
                    var data = rows[0];
                    if (!err) {

                        if (rows && rows.length > 0) {
                            const correctOtp = rows[0].otp;
                            if (otp == correctOtp) {

                                connection.query('Update user Set is_verified = 1 Where user_id = ?', user_id, (err, rows) => {
                                    connection.release();
                                    if (!err) {
                                        data.is_verified = 1;

                                        res.send(JSON.stringify({
                                            "result": "true",
                                            "msg": "OTP Successfully Verified",
                                            "data": data
                                        }));
                                    } else {
                                        res.send(JSON.stringify({
                                            "result": "false",
                                            "msg": err
                                        }));
                                    }
                                })


                            } else {
                                res.send(JSON.stringify({
                                    "result": "false",
                                    "msg": "Incorrect Otp! Please check and try again."
                                }));
                            }

                        } else {
                            res.send(JSON.stringify({
                                "result": "false",
                                "msg": "Invalid user_id. User not found!"
                            }));
                        }
                    } else {
                        res.send(JSON.stringify({
                            "result": "false",
                            "msg": err
                        }));
                    }

                })
            } else {
                res.send(JSON.stringify({
                    "result": "false",
                    "msg": "Parameter required user_id, otp"
                }));
            }
        } else {
            res.send(JSON.stringify({
                "result": "false",
                "msg": "Parameter required user_id, otp"
            }));
        }
    })
}

function resendOtp(data, res) {
    res.header('Content-Type', 'text/json')

    pool.getConnection((err, connection) => {
        if (err) {
            connection.release()
            res.send(JSON.stringify({
                "result": "false",
                "msg": err
            }));
        }

        var phone = data.body.phone
        var user_id = data.body.user_id

        if (phone && phone.length > 0 && user_id && user_id.length > 0) {
            connection.query('SELECT * FROM user Where user_id = ?', user_id, (err, rows) => {
                // connection.release() // return the connection to pool
                if (!err) {
                    if (rows && rows.length > 0) {
                        let otp = Math.floor(1000 + Math.random() * 9000);
                        rows[0].otp = otp.toString();

                        var data = [rows[0].otp, rows[0].user_id];
                        connection.query('Update user Set otp = ? Where user_id = ?', data, (err, result) => {
                            connection.release()
                            if (!err) {
                                res.send(JSON.stringify({
                                    "result": "true",
                                    "msg": "Resent OTP!",
                                    "data": {
                                        "user_id":user_id,
                                        "otp": rows[0].otp,
                                        "phone":rows[0].mobile
                                    }
                                }));
                            } else {
                                res.send(JSON.stringify({
                                    "result": "false",
                                    "msg": err
                                }));
                            }
                        });
                    } else {
                        res.send(JSON.stringify({
                            "result": "false",
                            "msg": "User Not Found!"
                        }));
                    }
                } else {
                    res.send(JSON.stringify({
                        "result": "false",
                        "msg": err
                    }));
                }
            })
        } else {
            res.send(JSON.stringify({
                "result": "false",
                "msg": "Parameter Required user_id, phone"
            }));
        }
    })
}

app.listen(port, () => console.log(`Listening on port ${port}`))