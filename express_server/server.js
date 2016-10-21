var http = require('http');
var express = require('express');

var app = express();

//There is no static file hosting required, as this is API server only
app.use(express.static('public'));

var server = http.createServer(app);
server.listen(3000);

app.get("/proxyresources", function(req, res) {
    return res.send([{
        name: 'proxy-r001',
        value: "proxy-Resources 001"
    }, {
        name: 'proxy-r002',
        value: "proxy-Resources 002"
    }]);
});

app.get("/proxyresources/1", function(req, res) {
    return res.json({
        name: 'proxy-r002',
        value: "proxy-Resources 002"
    });
});

app.post("/proxyresources", function(req, res) {
    return res.status(201).json(res.body);
});

app.use(function(req, res) {
    var err = new Error('Proxy Resource not found');
    err.status = 404;
    return res.status(err.status).json({
        "error": err.message
    });
});
