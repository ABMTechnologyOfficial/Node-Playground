const express = require('express')
const bodyParser = require('body-parser')
const mysql = require('mysql')

const app = express()
const port = process.env.PORT || 3000;


// app.use(express.urlencoded({extended: true})); 

// app.use(express.json()); 

// MySQL Code goes here
var connection = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : null,
    database : "NodeTest"
})


connection.connect(function(err) {
    if (err) {
        console.log(err.code);
        console.log(err.fatal);
    }
})

$query = "SELECT * FROM userinfo"

connection.query($query, function(err, rows, fields) {
    if (err) {
        console.log(err.code);
        console.log("An error occured with the query");
        return;
    }

    console.log("Query Successfully executed", rows);
})


connection.end(() => {
    console.log("Connection Closed");
})
// ------------------------------------------------ Api's ------------------------------------------------------ //


// Get all items








// ------------------------------------------------ Api's ------------------------------------------------------ //


// Listen on enviroment port or 5000
// app.listen(port, () => console.log(`Listening on port ${port}`))