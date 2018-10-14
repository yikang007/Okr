var express = require('express');
var nunjucks = require('nunjucks')

var app = express();

nunjucks.configure('views',{
    autoescape: true,
    express: app,
});

app.get('/homepage',function(req,res){
    res.render('homepage.html')
});

app.get('/details',function(req,res){
    res.render('details.html')
});

app.get('/personal',function(req,res){
    res.render('personal.html')
});


app.listen(3000)