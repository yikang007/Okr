var express = require('express');
var nunjucks = require('nunjucks');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var moment = require('moment');
var request = require('request')

var connection = mysql.createConnection({
    host: '192.168.0.110',
    user: 'root',
    password: '88888888',
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

app.get('/', function (req, res) {
    console.log('111111111')
    res.cookie("test", "value");
    // connection.query(`select *,
    //                 (select username from user where user.id = okr.user_id) as username,
    //                 (select avatar from user where user.id = okr.user_id) as avatar
    //                 from okr`, function (err, data) {
    //         // console.log('data:', data);
    //         var username = req.cookies.username;
    //         res.render('homepage.html', { okrs: data, username: username });
    //     })
    res.render('aaaa.html')
});

app.get('/api/homepage', function (req, res) {
    console.log('111111111')
    res.cookie("test", "value");
    var page = req.query.page || 1;
    var size = 10;
    connection.query(`select *,
                    (select username from user where user.id = okr.user_id) as username,
                    (select avatar from user where user.id = okr.user_id) as avatar
                    from okr limit ?, ?`, [(page - 1) * size, size], function (err, data) {
            var username = req.cookies.username;
            res.json({okr:data});
        })
});


app.get('/api/details/:id', function (req, res) {
    console.log('111111111')
    var okr_id = req.params.id;
    connection.query(`select * from okr where id=?`, [okr_id], function (err, data) {
            res.json(data[0]);
        });
});

app.get('/api/comments', function (req, res) {
    var okr_id = req.query.okr_id;
    var page = req.query.page || 1;
    var size = 10;

    connection.query(`select *,
                    (select username from user where user.id=comment.user_id) as username,
                    (select avatar from user where user.id=comment.user_id) as avatar
                    from comment where okr_id=? limit ?, ?`, [okr_id, (page - 1) * size, size], function (err, data) {
            res.json(data);
        })
});

app.get('/details/:id', function (req, res) {
    var okr_id = req.params.id;
    console.log('okr_id:', okr_id)
    connection.query(`select *,
                    (select username from user where user.id = comment.user_id) as username,
                    (select avatar from user where user.id = comment.user_id) as avatar,
                    (select object from okr where okr.id = comment.okr_id) as object,
                    (select key_results from okr where okr.id = comment.okr_id) as key_results,
                    (select action from okr where okr.id = comment.okr_id) as action
                    from comment where okr_id=?`, [okr_id], function (err, data) {
            var oid = res.cookie('id', okr_id)
            res.render('details-backup.html', { details: data });
        });
});

app.get('/personal/:id', function (req, res) {

    var user_id = req.params.id;
    var page = req.query.page || 1;
    var size = 10;

    connection.query('select * from user where id=?', [user_id], function (err, user_info) {
        console.log('user_info:',user_info)
        connection.query('select * from okr where user_id=? limit ?, 2', [user_id, (page - 1) * size, size], function (err, okr_list) {
            console.log('456:',okr_list)
            res.render('personal.html', { user_info: user_info, okr_list: okr_list });

        });

    });

});

app.post('/api/land', function (req, res) {
    // console.log(req.body.username)   
    var phone = req.body.phone;
    var password = req.body.password;

    connection.query('select * from user where phone=? and password=? limit 1', [phone, password], function (err, data) {
        res.cookie('pid', data[0].id)
        res.cookie('username', data[0].username)
        if (data.length > 0) {
            var token = phone + password + new Date().getTime()
            connection.query('update user as t set t.token = ? where phone = ?', [token, phone], function (err, data) {
                res.cookie('token', token)
                res.cookie
                // res.render('homepage.html')
                res.json({ code: 1 })
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
    var username = phone.substr(0, 3) + phone.substr(7);
    var token = req.body.token;
    var created_at = moment().format('l')

    connection.query('insert into user values (null, ?, ?, ?, "http://pic.58pic.com/58pic/15/61/85/55Y58PICXeV_1024.png", null, ?)', [phone, password, username, token, created_at], function (err, data) {
        res.render('homepage.html', { okrs: data });
    })
})


// app.get('/post', function (req, res) {
//     var connect = req.body.connect;
//     res.render('post.html')
// });

app.post('/api/post', function (req, res) {
    // var title = req.body.title;
    var o = req.body.o;
    var k = req.body.k;
    var r = req.body.r;
    // var image = req.body.image;
    var uid = req.cookies.pid;
    var created_at = moment().format('l')
    connection.query('insert into okr values (null, ?, ?, ?, ?, ?)', [o, k, r, uid, created_at], function (err, data) {
        res.render('homepage.html')
    })
    // console.log(content)
})

app.post('/api/content', function (req, res) {
    var oid = req.cookies.id;
    console.log('oid:', oid)
    var content = req.body.content;
    console.log(content)
    var pid = req.cookies.pid;
    var created_at = moment().format('l')
    connection.query('insert into comment values (null, ?, ?, ?, ?)', [oid, pid, content, created_at], function (err, data) {
        res.send('评论成功')
    })
})

app.post('/pai/like', function (req, res) {

})


app.listen(3000)