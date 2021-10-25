const express = require('express');
const mysql = require('mysql');

// Create Connection
var dbcon = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: '',
});

// Connect to MYSQL
dbcon.connect((err) => {
    if (err) {
        throw err;
    }
    console.log("Database Connected!");
});

const app = express();

// Create Database
app.get("/createdb", (req, res) => {
    let sql = "CREATE DATABASE wheeldb";
    dbcon.query(sql, (err) => {
        if (err) {
            throw err;
        }
        res.send("Database created");
    });
});

// Create Table
app.get('/createwheel', (req, res) => {
    let sql = 'CREATE TABLE wheel(id int AUTO_INCREMENT, question VARCHAR(100), answer VARCHAR(100), pointvalue INT(100)'
    dbcon.query(sql, err => {
        if (err) {
            throw err
        }
        res.send('Wheel table created')
    });
});

// Insert Question
app.get('/insertquestion', (req, rest) => {
    let post = { question: 'This is a question?', answer: 'This is an answer!', pointvalue: '50'
}
        let sql = 'INSERT INTO wheelSET ?'
        let query = dbcon(sql, post, err => {
    if (err) {
        throw err
    }
    res.send('Question added');
});
});

app.listen('3000', () => {
    console.log('Server Started on port 3000')
});

