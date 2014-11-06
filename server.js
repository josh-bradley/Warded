var express = require("express");
var app = express();
var data = require('./data');

var morgan = require("morgan");
var bodyParser = require("body-parser");

app.use(express.static(__dirname + '/public'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended': 'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({type: 'application/vnd.api+json'}));

app.listen(8080);

app.get('/api/wardCount', function(req, res){
    data.getWardCount(function(err, data){
        if(err){
            res.send(err);
        }

        res.json(data);
    });
});