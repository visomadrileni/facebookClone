const passport = require('passport');
const User = require('../models/User');

module.exports = (newUser,password,req,res) => {
    User.register(newUser,password, (err,user) => {
        if(err){
            req.flash("error",err,message);
            res.redirect('/')
        } else {
            passport.authenticate('local')(req,res, () => {
                console.log(req.user);
                req.flash("success","Success! You are registered and logged in")
                res.redirect('back')
            })
        }
    })
}