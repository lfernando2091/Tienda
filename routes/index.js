var express = require('express');
const mybatisMapper = require('mybatis-mapper');
var router = express.Router();

/*Conecxion a MySql
'LuisFernando2091'
'luisfernando2091'
*/

/* GET home page. */
router.get('/', function(req, res, next) {
    req.getConnection(function(error, conn) {
        conn.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
              if (error) throw error;
              console.log('The solution is: ', results[0].solution);
        });
    });
    /*
    req.session.store.connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
          if (error) throw error;
          console.log('The solution is: ', results[0].solution);
    });
    */
    res.render('index', { title: 'Tomorrowland' });
});

module.exports = router;
