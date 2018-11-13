var express = require('express');
var router = express.Router();

/*Conecxion a MySql
'LuisFernando2091'
'luisfernando2091'
*/

/* GET home page. */
router.get('/', function(req, res, next) {
	console.log(req.sessionID)
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
    res.render('index', { title: 'Mas Ferreterias' });
});

module.exports = router;
