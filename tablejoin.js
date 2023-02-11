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

pool.getConnection((err, connection) => {
    if (err) throw err

    var userId = 3;

    // var q1 = 'SELECT questions.question_id FROM questions LEFT JOIN attempts ON attempts.question_id=questions.question_id AND user_id = 2 WHERE user_id is null OR user_id != 2'
    // var q1 = 'SELECT questions.question_id, attempt_id, user_id FROM questions LEFT JOIN attempts ON attempts.question_id=questions.question_id AND user_id = 1 ORDER BY questions.question_id DESC'
    var q1 = 'SELECT question_id, coins, correct_answer From questions Where contest_id = 1'

    connection.query(q1,
        (err, rows) => {
            if (err) {
                console.log(rows);
            } else {

                for (let i = 0; i < rows.length; i++) {
                    const current = rows[i];

                    const currentQId = current.question_id;
                    
                    var q1 = 'Select q.question_id, correct_answer, answer From questions q Left Join attempts a On q.question_id = a.question_id Where q.question_id=?'
    
                    connection.query(q1, currentQId, (err, rows) => {
    
                        console.log(rows)
    
                    })
                }
            }
        })
})



app.listen(port, () => console.log(`Listening on port ${port}`))