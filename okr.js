var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var moment = require('moment');
var request = require('request');



var connection = mysql.createConnection({
    host: '192.168.0.110',
    user: 'root',
    password: '88888888',
    database: 'wang_pengfu'
})

connection.connect();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', function (req, res) {
    connection.query(`select *,
                    (select username from user where user.id = article.user_id) as username,
                    (select avatar from user where user.id = article.user_id) as avatar
                    from article`, function (err, data) {
            console.log('data:', data);
            var username = req.cookies.username;
            res.render('index.html', { articles: data, title: '我是首页', username: username });
        })

})


app.get('/article/:id', function (req, res) {
    var id = req.params.id;
    connection.query(`select *,
                    (select username from user where user.id = article.user_id) as username,
                    (select avatar from user where user.id = article.user_id) as avatar
                    from article where id=? limit 1`, [id], function (err, data) {
            console.log('article data:', data);
            res.render('article.html', { article: data[0], username: req.cookies.username });
        });
});

app.get('/register', function (req, res) {
    res.render('register.html')
});


app.get('/login', function (req, res) {
    res.render('login.html')
});

app.get('/posted', function (req, res) {
    var username = req.cookies.username;
    var avatar = req.cookies.avatar;

    res.render('posted.html',{ username : username , avatar : avatar})
});

app.post('/api/posted', function (req, res) {
    var title = req.body.title;
    var content = req.body.content;
    var image = req.body.image;
    var user_id = req.cookies.uid;
    var created_at = moment().format('YYYY-MM-DD HH:mm:ss');

    connection.query('insert into article values (null, ? , ? , ?, ? , ?)', [title, content, image, user_id, created_at], function (err, data) {
        res.send('发帖成功')
    })
})


app.post('/api/register', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var avatar = req.body.avatar;
    var created_at = moment().format('YYYY-MM-DD HH:mm:ss');

    connection.query('insert into user values (null, ? , ? , ? ,? )', [username, password, avatar, created_at], function (err, data) {
        res.send('注册成功', )
    })
})


app.post('/api/login', function (req, res) {
    var username = req.body.username;
    var password = req.body.password;

    connection.query('select * from user where username = ? and password = ? ', [username, password], function (err, data) {
        if (data.length > 0) {
            res.cookie('uid', data[0].id)
            res.cookie('username', data[0].username)
            res.cookie('avatar', data[0].avatar)
            res.send('登陆成功')
        }

        else {
            res.send('对不起，用户名或密码错误')
        }

    })
})

app.get('/about', function (req, res) {
    res.render('about.html')
})


app.get('/user', function (req, res) {
    var uid = req.cookies.uid;
    connection.query('select * from user where id = ?', [uid], function (err, data) {
        var user = data[0];
        res.render('user.html', { user: user })
    })

})



app.listen(3000)
