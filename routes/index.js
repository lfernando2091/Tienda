var express = require('express');
const mysql  = require('mysql');
const mybatisMapper = require('mybatis-mapper');
var router = express.Router();

/*Conecxion a MySql*/
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'LuisFernando2091',
  database : 'tienda'
});

connection.connect();

connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
  if (error) throw error;
  console.log('The solution is: ', results[0].solution);
});

connection.end();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Tomorrowland' });
});

module.exports = router;
