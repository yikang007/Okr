var express = require('express');
var nunjucks = require('nunjucks');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var moment = require('moment');
var request = require('request');

var connection = mysql.createConnection({
    host: '192.168.0.110',
    user: 'root',
    password: '88888888',
    database: 'okr'
});

connection.connect();

var app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app,
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.get('/', function (req, res) {
    console.log('111111111');
    res.render('homepage.html')
});

// app.get('/api/homepage', function (req, res) {
//     console.log('111111111');
//     res.cookie("test", "value");
//     // var page = req.query.page || 1;
//     // var size = 10;

    
//     connection.query(`select *,
//                     (select username from user where user.id = okr.user_id) as username,
//                     (select avatar from user where user.id = okr.user_id) as avatar
//                     from okr`, function (err, data) {
//             var username = req.cookies.username;
//             var avatar = req.cookies.avatar;
//             var user_id = req.cookies.user_id;
//             res.json({data,username,avatar,user_id});
//         });
// });
app.get('/api/homepage', function (req, res) {
    console.log('111111111');
    res.cookie("test", "value");
    var user_id = req.cookies.user_id;
    
    connection.query(`select *,
                    (select username from user where user.id = okr.user_id) as username,
                    (select avatar from user where user.id = okr.user_id) as avatar
                    from okr`, function (err, okr_data) {
                        connection.query(`select * from user where id=?`,[user_id],function(err,user_data){
                            res.json({okr_data,user_data})
                        });            
        });
})


app.get('/details',function(req,res){
    var id = req.cookies.okr_id;
    // console.log('123213:',id)
    res.render('details-backup.html');
});

app.get('/api/details/:id', function (req, res) {
    // console.log('111111111')
    var okr_id = req.params.id;
    console.log('12:',okr_id);
    connection.query(`select *,
                    (select username from user where user.id=okr.user_id) as username,
                    (select avatar from user where user.id=okr.user_id) as avatar
                    from okr where id=?`, [okr_id], function (err, data) {
            var id = res.cookie('okr_id',okr_id);
            var username = req.cookies.username;
            var avatar = req.cookies.avatar;
            var user_id = req.cookies.user_id;
            res.json({data,username,avatar,user_id})
            // console.log('111:',data);
        })
});

app.get('/api/comments/:id', function (req, res) {
    var okr_id = req.params.id;
    // console.log('okr_id:',okr_id);
    // var page = req.query.page || 1;
    // var size = 10;
    connection.query(`select *,
                    (select username from user where user.id=comment.user_id) as username,
                    (select avatar from user where user.id=comment.user_id) as avatar
                    from comment where okr_id=?`, [okr_id],function(err,data){
        res.json(data);
        // console.log('123:',data)
    });
});
// app.get('/api/comments/:id', function (req, res) {
//     var okr_id = req.params.id;
//     console.log('okr_id:',okr_id);
//     // var page = req.query.page || 1;
//     // var size = 10;
//     connection.query(`select * from comment where okr_id=?`, [okr_id],function(err,comment_data){
//         connection.query(`select * from okr where id=?`,[okr_id],function(err,okr_data){
//             res.json({comment_data,okr_data});
//         })
//     })
// });

app.get('/personal',function(req,res){
    res.render('personal.html');
})

app.get('/api/personal/:id', function (req, res) {
    var user_id = req.params.id;
    var page = req.query.page || 1
    var size = 10;

    connection.query('select * from user where id=?', [user_id], function (err, user_info) {
        // console.log('user_info:',user_info)
        connection.query(`select * from okr where user_id=? limit ?, 10`, [user_id, (page - 1) * size, size], function (err, okr_list) {
            // console.log('456:',okr_list)
            var username = req.cookies.username;
            var avatar = req.cookies.avatar;
            var user_id = req.cookies.user_id;
            res.json({user_info,okr_list,username,avatar,user_id});
        });
    });
});

app.post('/api/login', function (req, res) {
    // console.log(req.body.username)   
    var phone = req.body.phone;
    var password = req.body.password;

    connection.query('select * from user where phone=? and password=? limit 1', [phone, password], function (err, data) {
        console.log('1111:',data)
        if(data.length > 0){
            res.cookie('user_id', data[0].id)
            res.cookie('username', data[0].username);
            res.cookie('avatar',data[0].avatar);

            var token = phone + password + new Date().getTime()
            connection.query('update user as t set t.token = ? where phone = ?', [token, phone], function (err, data) {
                res.cookie('token', token);
                // res.render('homepage.html')
                res.json({ code: 1 });
            });
        }
        else {
            res.send('对不起，用户名或密码错误');
        }
    });
})

app.post('/api/register', function (req, res) {
    // console.log(req.body.phone)
    var phone = req.body.phone;
    var password = req.body.password;
    var username = phone.substr(0, 3) + phone.substr(7);
    var token = req.body.token;
    var created_at = moment().format('l');

    connection.query('select * from user where phone=? limit 1', [phone],function(err,data){
        console.log('data:',data)
        if(data == ''){
            connection.query('insert into user values (null, ?, ?, ?, "http://pic.58pic.com/58pic/15/61/85/55Y58PICXeV_1024.png", ?, ?)', [phone, password, username, token, created_at], function (err, data) {
                console.log('22:',data)    
                res.json({ code: 1 })
            })
        }
        else{
            res.send('账号已存在！')
        }
    }) 
})

app.post('/api/release', function (req, res) {
    // var title = req.body.title;
    var o = req.body.o;
    var k = req.body.k;
    var r = req.body.r;
    // var image = req.body.image;
    var uid = req.cookies.user_id;
    var created_at = moment().format('l');
    connection.query('insert into okr values (null, ?, ?, ?, ?, ?)', [o, k, r, uid, created_at], function (err, data) {
        res.render('homepage.html');
    });
})

app.post('/api/content', function (req, res) {
    var oid = req.cookies.okr_id;
    console.log('oid:', oid)
    var content = req.body.content;
    console.log(content)
    var user_id = req.cookies.user_id;
    var created_at = moment().format('l')
    connection.query('insert into comment values (null, ?, ?, ?, ?)', [oid, user_id, content, created_at], function (err, data) {
        console.log('1232131:',data)
        res.send('评论成功');
    })
})

app.post('/pai/like', function (req, res) {

})


app.listen(3000);