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
});

//posts have a many-to-one relationship with users and a one-to-many relationship with comments
const Posts = sequelize.define('posts', {
  title: {
    type: Sequelize.STRING,
  },
  body: {
    type: Sequelize.TEXT
  }
}, {
  timestamps: false
});

//comments have a many-to-one relationship with users and with posts
const Comments = sequelize.define('comments', {
  body: {
    type: Sequelize.TEXT
  }
}, {
  timestamps: false
});

User.hasMany(Posts);
User.hasMany(Comments);
Posts.hasMany(Comments);
Posts.belongsTo(User);
Comments.belongsTo(User);
Comments.belongsTo(Posts);

sequelize.sync();

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
    res.redirect(`/users/${user.username}`)
  })
});

app.get('/users/:username', (req,res) => {
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
      res.redirect(`/users/${user.username}`);
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

app.get('/posts', (req, res)=> {
  const user = req.session.user;
  if (user === undefined) {
    res.redirect('/?message=' + encodeURIComponent("Please log in to view the posts."));
  } else {
    Posts.findAll()
      .then((allPosts) => {
        res.render('allposts', {
          postList: allPosts,
          user: user
        })
      })
    .catch((error) => {
        console.error(error);
    });
  };
});

app.get('/posts/new', (req, res) => {
  res.render('newpost');
});

app.post('/posts/new', (req, res) => {
  Posts.create({
    title: req.body.title,
    body: req.body.body,
    userId: req.session.user.id
  })
  .then(() => {
    res.redirect('/posts');
  })
});

app.get('/posts/user', (req, res) => {
  const user = req.session.user;
  const userID = req.session.user.id;
  Posts.findAll({
    where: {
      userId: userID
    }
  })
  .then((myPosts) => {
    res.render('userposts', {
      userPosts: myPosts,
      user: user
    })
  })
});

const server = app.listen(3000, () => {
  console.log('Example app listening on port: ' + server.address().port);
})
