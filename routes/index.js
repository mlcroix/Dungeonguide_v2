var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json("welcome to dungeonguide_api V2!");
});

module.exports = router;
