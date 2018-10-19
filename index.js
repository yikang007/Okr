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
    // connection.query('select * from okr', function (err, data) {
    //     var phone = req.cookies.phone;
    //     res.render('homepage.html', {okrs:da吧   ta,phone: phone});
    // })
    connection.query(`select *,
                    (select username from user where user.id = okr.user_id) as username,
                    (select avatar from user where user.id = okr.user_id) as avatar
                    from okr`, function (err, data) {
            // console.log('data:', data);
            var username = req.cookies.username;
            res.render('homepage.html', { okrs: data, username: username });
        })
});
 
app.get('/details/:id', function (req, res) {
    var id = req.params.id; 
    console.log('id:',id)
    connection.query(`select *,
                    (select username from user where user.id = okr.user_id) as username,
                    (select avatar from user where user.id = okr.user_id) as avatar
                    from okr where id=? limit 1`, [id], function (err, data) {
            console.log('data:', data);
            // var username = req.cookies.username;
            res.render('details.html', { details: data[0]});
        });
});

// app.get('/details/:id', function (req, res) {
//     var id = req.params.id; 
//     console.log('id:',id)
//     connection.query(`select *,
//                     (select username from user where user.id = okr.user_id) as username,
//                     (select avatar from user where user.id = okr.user_id) as avatar
//                     from okr where id=? limit 1`, [id], function (err, data) {
//             console.log('data:', data);
//             // var username = req.cookies.username;
//             res.render('details.html', { okrs: data[0]});
//         });
// });

app.get('/personal', function (req, res) {
    res.render('personal.html')
});

app.post('/api/land', function (req, res){
    // console.log(req.body.username)   
    var phone = req.body.phone;
    var password = req.body.password;
   
    connection.query('select * from user where phone=? and password=? limit 1',[phone,password],function(err,data){
        res.cookie('pid',data[0].id)
        res.cookie('username',data[0].username)
        if (data.length > 0) {
            var token = phone + password + new Date().getTime()
            connection.query('update user as t set t.token = ? where phone = ?',[token, phone],function(err,data){
                res.cookie('token',token)
                res.render('homepage.html')
            })
            // res.cookie('pid',data[0].id)
            // res.cookie('username',data[0].username)
            // res.render('homepage.html')
        }
        else {
            res.send('对不起，用户名或密码错误')
        }
    })
})

app.post('/api/register', function (req, res) {
    // console.log(req.body.phone)
    var phone = req.body.phone;
    var password = req.body.password;
    var username = phone.substr(0,3)+phone.substr(7);
    var token = req.body.token;
    var created_at = moment().format('YYYY-MM-DD HH:MM:SS');

    connection.query('insert into user values (null, ?, ?, ?, "", null, ?)', [phone, password, username, token, created_at], function (err, data) {
        res.render('homepage.html', { okrs: data });
    })
})


app.get('/post', function (req, res) {
    var connect = req.body.connect;
    res.render('post.html')
});

app.post('/api/post',function(req,res){
        // var title = req.body.title;
        var o = req.body.o;
        var k = req.body.k;
        var r = req.body.r;
        // var image = req.body.image;
        var pid = req.cookies.pid;
        var created_at = moment().format('YYY-MM-DD HH:MM:SS');
        connection.query('insert into okr values (null, ?, ?, ?, ?, ?)',[o, k, r, pid, created_at], function(err,data){
            res.render('homepage.html')
        })
        // console.log(content)
    })


app.listen(3000)