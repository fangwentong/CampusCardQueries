var express = require('express');
var router = express.Router();
var spider = require('../utils/crawler.js');
var crypto = require('crypto');
var secret = require('../config/site.json').secret;

router.all('*', function(req, res, next) {
  // 签名验证
  var body = req.rawBody;
  var signature = req.headers['x-api-signature'];
  var err = new Error('');
  if(!signature) {
    err.status = 80002;
    next(err);
  }

  var digest = crypto.createHmac('sha1', secret).update(body).digest('hex');
  if (signature !== digest) {
    err.status = 80003;
    next(err);
  } else {
    next();
  }
});

router.post('/today', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  spider.login(username, password, function(err, cookie, accountId) {
    if (err) {
      console.log(err);
    } else {
      spider.getCostToday(cookie, accountId, function (err, costToday) {
        if (err) {
          console.log(err);
        } else {
          res.send({
            errcode: 0,
            cost: costToday,
          });
        }
      });
    }
  });
});

router.post('/during', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var start = req.body.start;
  var end = req.body.end;

  spider.login(username, password, function(err, cookie, accountId) {
    if (err) {
      console.log(err);
    } else {
      spider.getCostDuring(start, end, cookie, accountId, function (err, cost) {
        if (err) {
          console.log(err);
        } else {
          res.send({
            errcode: 0,
            cost: cost,
          });
        }
      });
    }
  });
});

module.exports = router;
