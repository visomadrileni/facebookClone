const isLoggedIn = (req,res,next) => {
    if(req.isAuthenticated()){
        return next()
    }
    req.flash("error","You need to be logged in")
    res.redirect("/user/login")
}

module.exports = isLoggedIn;