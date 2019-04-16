var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
const morgan = require('morgan');

var app = express();

app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer"'))

// view engine setup
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// --------------------------------------- 手动添加代理路径 --------------------------------

app.use('/', require('./routes'));

app.use('/data_upload', function(req, res){
    console.log("req.query---------------" + JSON.stringify(req.query));
    var request = require('request');
    var passiveRecorder_host = require('config').get('passiveRecorder.host');
    var passiveRecorder_port = require('config').get('passiveRecorder.port');
    var option = {
        url: "http://" + passiveRecorder_host + ":" + passiveRecorder_port + req.query.url,
        headers: req.headers,
    }

    var proxy = request(option);
    req.pipe(proxy);
    proxy.pipe(res);

    proxy.on('end', function () {
        console.log(res.statusCode, res.statusMessage);
        res.end();
    })

    proxy.on('error', function (err) {
        res.end(JSON.stringify(err));
        console.log(err);
    })
});

// --------------------------------------- ----------------- --------------------------------


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    console.log(res.locals.error);
    res.render('error');
});

module.exports = app;
