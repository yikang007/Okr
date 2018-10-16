var express = require('express');
var nunjucks = require('nunjucks');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
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
app.use(cookieParser());

app.get('/homepage', function (req, res) {
    res.cookie("test","value");
    connection.query('select * from okr', function (err, data) {
        var phone = req.cookies.phone;
        res.render('homepage.html', {phone: phone});
    })
});
 
app.get('/details', function (req, res) {
    res.render('details.html')
});

app.get('/personal', function (req, res) {
    res.render('personal.html')
});

app.post('/api/land', function (req, res){
    // console.log(req.body.username)
    var phone = req.body.phone;
    var password = req.body.password;
   
    connection.query('select * from user where phone=? and password=? limit 1',[phone,password],function(err,data){
        if (data.length > 0) {
            res.cookie('pid',data[0].id)
            res.cookie('phone',data[0].phone)
            res.render('homepage.html')
        }
        else {
            res.send('对不起，用户名或密码错误')
        }
    })
})

app.post('/api/register', function (req, res) {
    // console.log(req.body.username)
    var phone = req.body.phone;
    var password = req.body.password;
    var token = req.body.token;
    var created_at = moment().format('YYYY - MM - DD');

    connection.query('insert into user values (null, ?, ?, "", "", ?, ?)', [phone, password, token, created_at], function (err, data) {
        res.render('homepage.html', { okrs: data });
    })
})


// app.get('/post', function (req, res) {
//     var connect = req.body.connect;
//     res.render('post.html')
// });

app.post('/api/post',function(req,res){
        // var title = req.body.title;
        var content = req.body.content;
        // var image = req.body.image;
        var pid = req.cookies.pid;
        var created_at = moment().format('YYY-MM-DD');
        connection.query('insert into okr values (null, ?,"", "", ?, ?)',[content, pid, created_at], function(err,data){
            res.render('homepage.html')
        })
        // console.log(title,username,content)
    })


app.listen(3000)