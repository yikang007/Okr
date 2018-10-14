var express = require('express');
var app = express();

app.get('/homepage',function(req,res){
    res.send('首页')
});

app.get('/details',function(req,res){
    res.send('详情页面')
});

app.get('/personal',function(req,res){
    res.send('个人中心页面')
});


app.listen(3000)