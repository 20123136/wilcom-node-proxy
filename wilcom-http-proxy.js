const httpProxy = require('http-proxy');
//const port = require('./default.json').get('node.port');

var stripJsonComments  = require('strip-json-comments');//扒光json中的注解
var fs = require('fs'); // file system
var config = JSON.parse(stripJsonComments(fs.readFileSync('./default.json').toString()));
const port = config.node.port;

let proxy = httpProxy.createProxyServer();


let token = config.apollo.token;
proxy.on('proxyReq', function (proxyReq, req, res) {
    if (req.body) {
        let reqBody = JSON.stringify(req.body);
        console.log("--------- req from client agent --------------", reqBody);
        proxyReq.setHeader('Content-Length', Buffer.byteLength(reqBody, 'utf8'));
        proxyReq.setHeader('Authorization', token);
        proxyReq.setHeader('Content-Type', 'application/json;charset=UTF-8');
        proxyReq.write(reqBody);
        proxyReq.end();
    }
});
proxy.on('proxyRes', function (proxyRes, req, res) {
    // 设置允许跨域访问该服务.
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, OPTIONS, DELETE");
    res.header("Access-Control-Max-Age", "600"); // 将预检请求的结果(即 Access-Control-Allow-Methods 和Access-Control-Allow-Headers 提供的信息)缓存10分钟
    res.header("Access-Control-Allow-Headers", "content-type, Accept, X-Requested-With, remember-me");

    var resBody = new Buffer('');
    proxyRes.on('data', function (data) {
        resBody = Buffer.concat([resBody, data]);
    });
    proxyRes.on('end', function () {
        resBody = resBody.toString();
        console.log("--------- res from proxied server -------------", resBody);
    });
});
proxy.on('error', function (err, req, res) {
    res.writeHead(500, {
        'Content-Type': 'text/plain'
    });
    res.end('Something went wrong. And we are reporting a custom error message.');
});


/**
 * req 的一些参数示例：
 * url: '/loginPortal',
 * baseUrl: '/passive-recorder',
 * originalUrl: '/passive-recorder/loginPortal',
 */
module.exports = function (req, res, hostinfo, baseUrl) {
    baseUrl = baseUrl === undefined ? "" : baseUrl;
    console.log('===================================http://' + hostinfo.host + ':' +  hostinfo.port + baseUrl);
    proxy.web(req, res, {
        target: 'http://' + hostinfo.host + ':' +  hostinfo.port + baseUrl,
    },(e)=>{
        console.log("proxy error call back ");
        console.log(e);
        res.json(e);
    });
};




