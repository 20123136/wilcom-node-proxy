let routes = require('./wilcom-http-proxy');
let express = require('express');
let router = express.Router();


var stripJsonComments  = require('strip-json-comments');//扒光json中的注解
var fs = require('fs'); // file system

var config = JSON.parse(stripJsonComments(fs.readFileSync('./default.json').toString()));

router.use('/passive-recorder', function (req, res) {
    routes(req, res, config.passiveRecorder, req.baseUrl);
})

router.use('/security', function (req, res) {
    routes(req, res, config.security, req.baseUrl);
})

router.use('/apollo', function (req, res) {
    routes(req, res, config.apollo);
})
router.use('/appId', function (req, res) {
    res.json(config.apollo);
})

module.exports = router;
