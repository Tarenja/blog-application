Summary

Project Specification
Create a blogging application that allows users to do the following:
- register an account
- login
- logout

Once logged in, a user should be able to:
- create a post
- view a list of their own posts
- view a list of everyone's posts
- view a specific post, including the comments people have made about it
- leave a comment on a post

Prior to coding, determine the following:
- your tables: what columns will they have? How will they connect to one another?
- make a diagram showing the relationships between tables.
- your routes: what routes should you have? What should each route do?
Once you are done designing your application, then proceed with coding.
Submit this document in a text file as part of your application.

Other requirements:
Your routes must be "RESTful". See slide 4 of the http requests lecture: Link. Also look at the RESTful routing example in the node sample apps.
You must use Sequelize for this assignment. Your connection string must once again be read from the environment variables you set up for the Bulletin Board assignment.
Commit well - each commit should ideally be a new piece of functionality.

My diagrams and preparation below:

3 Tables:
Users - columns: id, username, email, password
Posts - columns: id, title, body, userId
Comments - columns: body, userID, postID

Relationships:
User.hasMany(Posts);
User.hasMany(Comments);
Posts.hasMany(Comments);
Posts.belongsTo(User);
Comments.belongsTo(User);
Comments.belongsTo(Posts);

Routes I will need:
HTTP  | URL               | action
-----------------------------------
GET   |         '/'       | display homepage/login form
GET   |    '/register'    | display register form
POST  |    '/register'    | register/create user
GET   | '/users/:username'| show profile page with username in route
POST  |    '/login'       | login the user, start session
GET   |    '/logout'      | logout the user, destroy session
GET   |    '/posts'       | display all posts
GET   |    '/posts/new'   | display form to create new post
POST  |    '/posts/new'   | create a new post and send to database
GET   |    '/posts/user'  | get all posts belonging to logged in user only
GET   | '/posts/:postId'  | display the post on a page with its id in URL
POST  |   '/comments'     | create a new comment and send to database
