 const mongoose = require('mongoose');
 const Schema = mongoose.Schema;
 const bcrypt = require('bcrypt');

 const UserSchema = new Schema({
     firstName:{
        type: String,
        required:true,
        lowercase:true
        },
     lastName: {
            type: String,
            required:true,
            lowercase:true
        },
     email: {
            type: String,
            required:true,
            lowercase:true
            },
     password:  {
        type: String,
        required:true,
        lowercase:true
       }       
 });

 UserSchema.pre('save', function(next){
   if(!this.isModified('password')){ next() }
   this.password = bcrypt.hash(this.password,10,(err,hash) => hash);
  })
 
  UserSchema.methods.comparePassword = rpassword => {
      const isMatch = bcrypt.compare(rpassword,this.password);
      return isMatch;
  }

 module.exports = mongoose.model('User',UserSchema);
