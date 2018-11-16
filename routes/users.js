var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  	res.send('respond with a resource');
});

module.exports = router;
