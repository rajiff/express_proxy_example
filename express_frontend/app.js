var http = require('http');
var express = require('express');
var proxy = require('http-proxy');

var app = express();
var platformProxy = proxy.createProxyServer();

app.use(express.static('public'));

var server = http.createServer(app);
server.listen(8080);

app.get("/resources", function(req, res) {
    return res.send([{
        name: 'r001',
        value: "Resources 001"
    }, {
        name: 'r002',
        value: "Resources 002"
    }]);
});

app.get("/resources/1", function(req, res) {
    return res.json({
        name: 'r002',
        value: "Resources 002"
    });
});

app.post("/resources", function(req, res) {
    return res.status(201).json(res.body);
});

//The below app route config should be placed after all the local resources have ended 
app.use(function(req, res) {
    var options = {
        target: {
            host: 'localhost',
            port: 3000
        }
    };
    platformProxy.web(req, res, options);
});

platformProxy.on('error', function(err, req, res) {
    console.log("Error in proxy pass: ", err);
});

platformProxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader('customer-header', 'custom-header-value');
});

app.use(function(req, res) {
    return res.status(401).send({
        message: "Resource not found"
    });
});
