// A dumb server that will respond to various requests with
// slow and erroneous responses

var express = require('express');
var app = express();
var morgan = require('morgan');
var fs = require('fs');
var http = require('http');
var port = 3000;
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

// all requests have this base path
var basePath = process.env.ROOT_PATH ? process.env.ROOT_PATH : '/fake-server' 

if (cluster.isMaster) {
  // Fork workers.
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });

} else {

  // 5MB file pulled from a list of spanish html files found:
  // wget https://dumps.wikimedia.org/other/static_html_dumps
  // we'll just load this in memory
  var contents = fs.readFileSync('sample_data.txt', 'utf8');
  var getData = function(stringSize) {
    // return strings up to 5mB in size
    if (!stringSize) {
      stringSize = 1000;
    }
    var start = parseInt(Math.random() * 5000000)
    var end = start + stringSize
    var payload = contents.slice(start, end)
    return JSON.stringify({data: payload});
  };
  
  var accessLogStream = fs.createWriteStream(__dirname + '/access.log', {flags: 'a'});
  app.use(morgan('tiny', {
      stream: accessLogStream
  }));
  app.get('/health', function(req, res) {
    res.send('OK');
  });
  
  // TIP: server timeout is 60s. client can call with > 60s to get a timeout
  
  // GET request e.g. /get/2000/10000 for a ~2000ms delayed response
  // and a 10k semi-randomized payload
  app.get(basePath + '/get/:ms/:size', function(req, res) {
    setTimeout(function() {
      res.send(getData(parseInt(req.params.size)));
    }, parseInt(req.params.ms));
  });
  
  // delayed POST request
  app.post(basePath + '/post/:ms/:size', function(req, res) {
    setTimeout(function() {
      res.send(getData(parseInt(req.params.size)));
    }, parseInt(req.params.ms));
  });
  
  // delayed PUT request
  app.put(basePath + '/put/:ms/:size', function(req, res) {
    setTimeout(function() {
      res.send(getData(parseInt(req.params.size)));
    }, parseInt(req.params.ms));
  });
  
  // error GET request with variable delay
  app.get(basePath + '/error/:ms', function(req, res) {
    setTimeout(function() {
      res.type('text/plain');
      res.status(500);
      res.send('500 - Server Error');
    }, parseInt(req.params.ms));
  });
  
  app.use(function(req, res) {
    res.type('text/plain');
    res.status(404);
    res.send('404 - Not Found');
  });
  
  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
  });
  
  console.log('start server');
  // HTTP
  http.createServer(app).listen(port);
  
}
