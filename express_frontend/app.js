var http = require('http');
var express = require('express');
var proxy = require('http-proxy');
var bodyParser = require('body-parser');

var app = express();

app.use(express.static('public'));

var server = http.createServer(app);
server.listen(8080);

/*app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));*/

// create application/json parser 
var jsonBodyParser = bodyParser.json();
// create application/x-www-form-urlencoded parser 
var urlEncodedParser = bodyParser.urlencoded({
    extended: false
});

//Because we are forwarding to proxy, to handle local bordy parsing, use the below way to parse the body, 
//so that only for the matched routes, we parse the body and for all other, we do not disturb the body data, so that proxy will not be any problem

app.get("/resources", jsonBodyParser, urlEncodedParser, function(req, res) {
    return res.send([{
        name: 'r001',
        value: "Resources 001"
    }, {
        name: 'r002',
        value: "Resources 002"
    }]);
});

app.post("/resources", jsonBodyParser, urlEncodedParser, function(req, res) {
    var data = req.body;
    data["_id"] = "This is front end post request";
    return res.json(data);
});

app.get("/resources/1", jsonBodyParser, urlEncodedParser, function(req, res) {
    return res.json({
        name: 'r002',
        value: "Resources 002"
    });
});

app.post("/resources", jsonBodyParser, urlEncodedParser, function(req, res) {
    return res.status(201).json(req.body);
});

//The below app route config should be placed after all the local resources have ended 
var platformProxy = proxy.createProxyServer();
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
