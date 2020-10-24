 const express = require('express');
 const app = express();
 require('dotenv').config();
 const bodyParser = require('body-parser');
 const expressSession = require('express-session');
 const flash = require('connect-flash');
 const User = require('./models/User');
 const userRoutes = require('./routes/users')
 const postRoutes = require('./routes/posts');
 const connectDb = require('./middleware/db');

 connectDb();
 app.set('view engine','ejs');
 app.use(bodyParser.json());  
 app.use(bodyParser.urlencoded({extended: true }));  
 app.use(express.static("public"))
 //Initialize express-session to allow us track the logged-in user across sessions
 app.use(expressSession({
     secret: "secretKey",
     resave: false,
     saveUninitialized: false
 }))
 app.use(flash())

 app.use(userRoutes);
 app.use(postRoutes);

 const port = process.env.PORT || 3000;
 app.listen(port, () => console.log('App is running on port ' +port))
