var express = require('express');
var nunjucks = require('nunjucks');
var mysql = require('mysql');

var connection = mysql.createConnection({
    host: '192.168.0.110',
    user: 'root',
    password: ' ',
    database: 'okr'
});

connection.connect()

var app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app,
});

app.get('/homepage', function (req, res) {
    connection.query('select * from okr', function (err, data) {
        res.render('homepage.html', { okr: data });
    })

});

app.get('/details', function (req, res) {
    res.render('details.html')
});

app.get('/personal', function (req, res) {
    res.render('personal.html')
});


app.listen(3000)