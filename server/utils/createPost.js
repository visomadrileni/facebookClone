const Post = require('../models/Post');
 
 module.exports = (newPost,req,res) => {
     Post.create(newPost,(err,post) => {
         if(err){ 
             console.log(err)
        } else {
            req.user.posts.push(post._id);
            req.user.save();
            res.redirect('/')
        }
     })
 }