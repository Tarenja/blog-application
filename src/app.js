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
  resave: false
}));

//model definition
//users have a one-to-many relationship with both posts and comments
const User = sequelize.define('users', {
  username: {
    type: Sequelize.STRING,
    unique: true
  },
  email: {
    type: Sequelize.STRING,
    unique: true
  },
  password: {
    type: Sequelize.STRING
  }
}, {
  timestamps: false
})

//posts have a many-to-one relationship with users and a one-to-many relationship with comments
// const Posts = sequelize.define('posts', {
//   title: {
//     type: Sequelize.STRING,
//     unique: true
//   },
//   body: {
//     type: Sequelize.TEXT
//   }
// })

//comments have a many-to-one relationship with users and with posts
// const Comment = sequelize.define('comments', {
//   body: {
//     type: Sequelize.TEXT
//   }
// });

//Routing, login form is on index page
app.get('/', (req, res) => {
  res.render('index', {
    message: req.query.message,
    user: req.session.user
  });
});

app.get('/register', (req,res) => {
  res.render('register');
})

app.post('/register', (req,res) => {
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  })
  .then((user) => {
    req.session.user = user;
    res.redirect('/profile')
  })
});

app.get('/profile', (req,res) => {
  const user = req.session.user;
  if (user === undefined) {
    res.redirect('/?message=' + encodeURIComponent("Please log in to view your profile."));
  } else {
    res.render('profile', {
      user: user
    })
  }
});

app.post('/login', (req, res) => {
  if (req.body.username.length === 0) {
    res.redirect('/?message=' + encodeURIComponent("Please fill in your username."))
    return;
  }
  if (req.body.password.length === 0) {
    res.redirect('/?message=' + encodeURIComponent("Please fill in your password."))
    return;
  }
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({
    where: {
      username: req.body.username
    }
  })
  .then((user) => {
    if (user !== null && password === user.password) {
      req.session.user = user;
      res.redirect('/profile');
    } else {
      res.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
    }
  })
  .catch((error) => {
    console.error(error);
    res.redirect('/?message=' + encodeURIComponent("Invalid email or password."));
  });
});

app.get('/logout', (req, res) =>{
	req.session.destroy(function(error) {
		if(error) {
			throw error;
		}
		res.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	})
});

sequelize.sync().then(() => {
		const server = app.listen(3000, () => {
			console.log('Example app listening on port: ' + server.address().port);
		})
	})
  .catch((error) => {
    console.error('sync failed: ' + error)
  })
