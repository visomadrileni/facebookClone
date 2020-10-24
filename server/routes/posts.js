 const app = require('express').Router();
 const cloudinary = require("cloudinary")
 const upload = require('../middleware/upload');
 const isLoggedIn = require('../middleware/isLoggin')
 const Post = require('../models/Post');
 const User = require('../models/User');
 const Comment = require('../models/Comment');
 const createPost = require('../utils/createPost');

 cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
 })

 //Index page
 app.get('/',isLoggedIn,(req,res) => { 
     User.findById(req.user._id).populate({ //get friends posts
          path: "friends",
          populate: {
              path: "posts",
              model: "Post"
          }
     }).populate("posts")  //get current users posts
       .exec((err,user) => {
           if(err){
               req.flash("error","There has been an error finding all posts")
               res.render("posts/index") //posts will be undefined
           } else {
               let posts = [];
               for(let i=0;i < user.friends.length; i++){
                   for(let j =0;j < user.friends[i].posts.length; j++){
                       posts.push(user.friends[i].posts[j])
                   }
               }

               for(let i=0;i<user.posts.length;i++){
                   posts.push(user.posts[i])
               }

               if(posts){ //we render posts.index view that we specify app.set("view engine","type of file that will be view html,ejs,hbs etc") 
                   res.render("posts/index",{posts})
               } else {
                   res.render("posts/index",{posts:null})
               }
           }
       })
 })

 //User like a post
 app.get('/post/:id/like',isLoggedIn,(req,res) => {
     User.findById(req.user._id,(err,user) => {
         if(err){
             req.flash("error","There has been an error trying to like this post,are you logged in?")
             res.redirect('back')
         } else {
            Post.findById(req.params.id,(err,post) => {
                if(err){
                    console.log(err)
                    req.flash("There has been an error trying to like this post,are you sure that is correct URL")
                    res.redirect('back')
                } else {
                    for(let i=0;i<user.liked_posts.length;i++){
                        if(user.liked_posts[i].equals(post._id)){
                            req.flash("error","You already liked this post")
                            return res.redirect('back')
                        }
                    }

                    post.likes = post.likes + 1;
                    post.save();
                    user.liked_posts.push(post._id)
                    user.save();
                    req.flash("error",`You successfully liked ${post.creator.firstName}'s post`)
                    res.redirect('back') 
                }
            })
         }
     })
 })

 //user likes a comment
 app.get('/post/:postId/comments/:commentId/like',isLoggedIn,(req,res) => {
     User.findById(req.user._id,(err,user) => {
         if(err){
             req.flash("error","There has been an error trying to like this post")
             res.redirect('back')
         } else {
             Comment.findById(req.params.commentId,(commErr,comment) => {
                 if(commErr){
                     req.flash("error","There has been an error trying to find the comment,are you sure the Url is correct")
                     res.redirect('back')
                 } else {
                     comment.likes = comment.likes + 1;
                     comment.save();
                     user.liked_comments.push(comment._id);
                     user.save();
                     req.flash("Success",`You successfully liked ${comment.creator.firstName}'s comment`)
                     res.redirect('back')
                 }
             })
         }
     })
 })

 app.post('/post/new',isLoggedIn,upload.single("image"),(req,res) => {
     if(req.body.content){
         let newPost = {};
         if(req.file){
             cloudinary.uploader.upload(req.file.path,result => {
                newPost.image = result.secure_url;
                newPost.creator = req.user;
                newPost.time = new Date();
                newPost.likes = 0;
                newPost.content = req.body.content;
                return createPost(newPost,req,res) 
             })
         } else {
            newPost.image = null;
            newPost.creator = req.user;
            newPost.time = new Date();
            newPost.likes = 0;
            newPost.content = req.body.content;
            return createPost(newPost,req,res) 
         }
     }
 })

 app.get('/post/new',isLoggedIn,(req,res) => {
     res.render('/posts/new');
 })

 app.get('/post/:id',isLoggedIn,(req,res) => {
     Post.findById(req.params.id).populate("comments").exec((err,post) => {
         if(err){
             req.flash("error","There has been an error finding this post")
             res.redirect('back')
         } else {
             res.render('posts/show',{post})
         }
     })
 })

 app.post('/post/:id/comments/new',isLoggedIn,(req,res) => {
     Post.findById(req.params.id,(err,post) => {
         if(err){
             req.flash("error","There has beem an error posting you comment")
             res.redirect('back')
         } else {
             Comment.create({content: req.body.content }, (err,comment) => {
                 if(err){
                     req.flash("error","Something went wrong with posting your comment")
                     res.redirect('back')
                 } else {
                     comment.creator._id = req.user.id;
                     comment.creator.firstName = req.user.firstName;
                     comment.creator.lastName = req.user.lastName;
                     comment.likes = 0;
                     comment.save();
                     post.comments.push(comment);
                     post.save();
                     req.flash("success","Successfully posted your comment");
                     res.redirect('/post' +post._id)
                 }
             })
         }
     })
 })

 module.exports = app;