//requiring all used modules, initializing express
const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const session = require('express-session');

//configuring and initializing modules
const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');
app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.urlencoded({ extended: true }));
const sequelize = new Sequelize('blog', process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
  host: 'localhost',
  dialect: 'postgres',
});
app.use(session({
  secret: "such secret, many wows",
  saveUninitialized: true,
  resave: true
}));

//model definition
//users have a one-to-many relationship with both posts and comments
const User = sequelize.define('users', {
  username: {
    type: Sequelize.STRING,
    unique: true
  }
  email: {
    type: Sequelize.STRING,
    unique: true
  }
  password: {
    type: Sequelize.STRING
  }
}, {
  timestamps: false;
})

//posts have a one-to-many relationship with users
// const Posts = sequelize.define('posts', {
//   title: {
//     type: Sequelize.STRING,
//     unique: true
//   }
//   body: {
//     type: Sequelize.TEXT,
//   }
// })
