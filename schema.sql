-- create database `okr`;

-- use `okr`;

-- create TABLE `user` (
--     `id` INT(11) unsigned auto_increment PRIMARY KEY,
--     `phone` VARCHAR(11) UNIQUE,
--     `password` VARCHAR(32) NOT NULL,
--     `username` VARCHAR(32),
--     `avatar` VARCHAR(255) NOT NULL,
--     `token` VARCHAR(255),
--     `created_at` DATETIME not NULL
-- ) DEFAULT charset=utf8;

insert into user values (null,'121212','123','','http://pic.58pic.com/58pic/15/61/85/55Y58PICXeV_1024.png','','2018-10-17 13:54:22')



-- create TABLE `users` (
--     `id` INT(11) unsigned auto_increment PRIMARY KEY,
--     `username` VARCHAR(32),
--     `password` VARCHAR(32) NOT NULL,
--     `token` VARCHAR(255) UNIQUE,
--     `created_at` DATETIME not NULL
-- ) DEFAULT charset=utf8;


-- create TABLE `okr` (
--     `id` INT(11) unsigned auto_increment PRIMARY KEY,
--     `object` varchar(255),
--     `key_results` VARCHAR(255),
--     `action` VARCHAR(255),
--     `user_id` int(32) NOT NULL,
--     `created_at` DATETIME not NULL
-- ) DEFAULT charset=utf8;


-- create TABLE `comment` (
--     `id` INT(11) unsigned auto_increment PRIMARY KEY,
--     `okr_id` int(11),
--     `user_id` int(32) NOT NULL,
--     `content` VARCHAR(255),
--     `created_at` DATETIME not NULL
-- ) DEFAULT charset=utf8;


-- create TABLE `like` (
--      `id` INT(11) unsigned auto_increment PRIMARY KEY,
--     `okr_id` int(11),
--     `user_id` int(32) NOT NULL,
--     `status` int comment '1: 赞，2，取消赞',
--     `created_at` DATETIME not NULL
-- ) DEFAULT charset=utf8;






