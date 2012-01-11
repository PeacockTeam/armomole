
var util = require("util"),
    url = require("url"),
    express = require("express"),
    getsamples = require('./getsamples.js');

var app = module.exports = express.createServer();

// Don't crash on errors.
process.on("uncaughtException", function(error) {
  util.log(error.stack);
});

app.configure(function(){
        app.set('views', __dirname + '/views');
        app.set('view engine', 'jade');
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(require('stylus').middleware({ src: __dirname + '/public' }));
        app.use(app.router);
        app.use(express.static(__dirname + '/public'));
        });

app.configure('development', function(){
        app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
        });

app.configure('production', function(){
        app.use(express.errorHandler()); 
        });

app.use(express.bodyParser());
app.use(app.router);

//Routes

function addHeaders(res) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
}

app.get('/*',function(req, res, next) {
    addHeaders(res);
    next();
});
app.post('/*',function(req, res, next) {
    addHeaders(res);
    next();
});

app.get('/', function(req, res) {
    res.send('I will kill you');
});

app.get('/musicgame', function(req, res){
      res.render('index', { title: 'Music Game' });
});

app.post('/getsamples/', function(req, res, next) {
    getsamples.getAudioSamples(req.body.url, function(samples) {
        if (samples == null) {
            res.send({ "error": "failed to get samples" });
        } else {
            res.send({ samples: samples });
        }
    });
});

app.listen(80);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
