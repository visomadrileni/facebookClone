const app = require('express').Router();
const passport = require('passport');
const cloudinary = require('cloudinary');
const User = require('../models/User');
const upload = require('../middleware/upload');
const createUser = require('../utils/createUser');
const isLoggedIn = require('../middleware/isLoggin');
const {check,validationResult} = require('express-validator');

      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });


 app.post('/user/register',async (req,res) => {
    const {email,firstName,lastName,newPassword} = req.body;

       let newUser =  new User({firstName,lastName,email,password:newPassword});
       await newUser.save();
       res.status(201).json(newUser)
  })

 app.post('/user/login',[ check('email','Email is empty').notEmpty().isEmail(),check('password','Password field is empty').notEmpty()],async (req,res) => {
    try{ 
        const {email,password} = req.body;
        let errors = validationResult(req);
        if(!errors.isEmpty()){
            let array = [];
            errors.array().forEach(e => array.push(e.msg));
            res.json({ message: array })
        }else{
            User.find({email:email,password:password},(err,user) => {
                if(err){
                    console.log(err);
                    res.json({message: 'User not found'})
                } else if(user){
                       res.json({
                           success: true,
                           message: `Welcome ${username}`
                       })
                    }
            });
         }
       }catch(err){
       console.log(err);
 }})

 app.get('/user/logout',(req,res) => {
     req.logout();
     res.redirect('back');
 })

 app.get('/user/all',isLoggedIn,(req,res) => {
     User.find({},(err,users) => {
         if(err){
             req.flash("error","There has been a problem getting all users info");
             res.redirect("/")
         } else {
           res.render('users/users',{users})
         }
     })
 })

 app.get('/user/:id/profile',isLoggedIn,(req,res) => { //getting the user data(including friends and friend requests)
     User.findById(req.params.id).populate("friends").populate("friendRequests").populate("posts").exec((err,user) => {
         if(err){
             req.flash("error","There has been an error");
             res.redirect('back')
         } else {
             res.render('users/user',{userData:user}) //We render the page without the friends array
         }
     })
 })

 app.get('/user/:id/add',isLoggedIn,(req,res) => {
     User.findById(req.user._id, (err,user) => {
         if(err){
            req.flash("error","There has been an error adding this person to your friends list")
            res.redirect('back')
         } else { //finds the user that need to be added
             User.findById(req.params.id, (err,userFound) => {
                 if(err){
                     req.flash("error","Person not found")
                     res.redirect('back')
                 } else {
                     if(userFound.friendRequests.find(uf => uf._id === user._id)){
                         req.flash("error",`You have already sent a friend request to ${user.firstName}`)
                         return res.redirect('/')
                     } else if(userFound.friends.find(f => f._id === user._id)){
                         req.flash("error",`${userFound.firstName} is already your friend`);
                         return res.redirect('/')
                     }

                     let currentUser = {
                           _id: user._id,
                           firstName: user.firstName,
                           lastName: user.lastName
                          };

                     userFound.friendRequests.push(currentUser);
                     userFound.save();
                     req.flash("success",`Success! You sent ${userFound.firstName} a friend request`) 
                     res.redirect('/')    
                 }
             })
         }
     })
 })

 app.get('/user/:id/accept',isLoggedIn,(req,res) => {
     User.findById(req.user._id, (err,user) => {
         if(err){
             req.flash("error","There has been an error finding your profile,are you connected")
             res.redirect('back')
         } else {
             User.findById(req.params.id, (err,userFound) => {
                  let isFriendReq = user.friendRequests.find(fl => fl._id === req.params.id);
                  if(isFriendReq){
                      let index = user.friendRequests.indexOf(isFriendReq);
                      user.friendRequests.splice(index,1); //now remove this user from friendRequest array and put to friends if we accept
                      let friend = {
                          _id: userFound._id,
                          firstName: userFound.firstName,
                          lastName: userFound.lastName
                          }
                      user.friends.push(friend);
                      user.save();
                      
                      let currentUser = {
                          _id: user._id,
                          firstName: user.firstName,
                          lastName: user.lastName
                         }
                      userFound.friends.push(currentUser) 
                      userFound.save();
                      req.flash("success",`You and ${userFound.firstName} are now friends`)
                      res.redirect('back')  
                  } else {
                      res.flash("error","There has been an error,is the profile you are trying to add on your requests?");
                      return res.redirect('back')
                  }
             })
         }
     })
 })

 app.get('/user/:id/decline',isLoggedIn, (req,res) => {
     User.findById(req.user._id,(err,user) => {
         if(err){
             req.flash("error","There has been an error decline the request")
             res.redirect('/')
         } else {
             User.findById(req.params.id, (err,userFound) => {
                 let isFriendReq = user.friendRequests.find(fl => fl.id.equals(userFound._id))
                 if(isFriendReq){
                     let index = user.friendRequests.indexOf(isFriendReq);
                     user.friendRequests.splice(index,1); //we remove this user from friendRequest array(where are all request for friend)
                     user.save();
                     req.flash("success","You declined a new request for friend")
                     res.redirect('back')
                 }
             })
         }
     })
 })

 app.get('/chat',isLoggedIn,(req,res) => {
     User.findById(req.user._id).populate("friends").exec((err,user) => {
         if(err){
             req.flash("error","There has been an error trying to create a new chat")
             res.redirect('back')
         } else {
             res.render('users/chat',{userData:user})
         }
     })
 })

 module.exports = app;

 /*

('user/login',[ check('username','Username is empty').notEmpty(),check('password','Password field is empty').notEmpty()],async (req,res) => {
     try{  //(In app.js I set cookieName: 'session') we refer as req.session because if we will set cookieName: 'mysession' so we will refer as req.mysession
         const {username,password} = req.body;
   
         let errors = validationResult(req);
         if(!errors.isEmpty()){
             let array = [];
             errors.array().forEach(e => array.push(e.msg));
             res.json({ message: array })
         }else{
             User.findOne({username:username},(err,user) => {
                 if(err){
                     console.log(err);
                    res.json({message: 'User not found'})
                 } else if(user){
                        res.json({
                            success: true,
                            message: `Welcome ${username}`
                        })
                     }
             });
        }catch(err){
            console.log(err);
        }

 */