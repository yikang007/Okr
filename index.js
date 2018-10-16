var express = require('express');
var nunjucks = require('nunjucks');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var moment = require('moment');

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

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/homepage', function (req, res) {
    connection.query('select * from okr', function (err, data) {
        res.render('homepage.html', { okrs: data });
    })
});

app.get('/details', function (req, res) {
    res.render('details.html')
});

app.get('/personal', function (req, res) {
    res.render('personal.html')
});

app.post('/api/homepage', function (req, res){
    // console.log(req.body.username)
    var password = req.body.password;
    var username = req.body.username;

    connection.query('select * from users where username=? and password=? limit 1',[username,password],function(err,data){
        if (data.length > 0) {
            res.send('登陆成功')
        }
        else {
            res.send('对不起，用户名或密码错误')
        }
    })
})

app.post('/api/homepage', function (req, res) {
    // console.log(req.body.username)
    var password = req.body.password;
    var username = req.body.username;
    var token = req.body.token;
    var created_at = moment().format('YYYY - MM - DD');

    connection.query('insert into user values (null, 2, ?, ?, 2, ?, ?)', [username, password, token, created_at], function (err, data) {
        res.send('注册成功')
    })
})


app.listen(3000)