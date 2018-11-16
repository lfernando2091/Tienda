var express = require('express');
var router = express.Router();

/*Conecxion a MySql
'LuisFernando2091'
'luisfernando2091'
*/

/* GET home page. */
router.get('/', function(req, res, next) {
    res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.render('index', { title: 'Mas Ferreterias' });
});

module.exports = router;
