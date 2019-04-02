const mysql = require('mysql');

const con = mysql.createConnection({
  host: "localhost",
  user: "hamster",
  password: "160518",
  database: "hamsterdb",
  port: "3306"
});

con.connect((err)=> {
    if (err) throw err;
    console.log("Database connected!");
  });