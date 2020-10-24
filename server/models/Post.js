 const mongoose = require('mongoose');
 const Schema = mongoose.Schema;

 const PostSchema = new Schema({
     content: String,
     time: Date,
     likes: Number,
     image: String,
     creator: {
         _id: {
             type: Schema.Types.ObjectId,
             ref: "User"
            },
        firstName: String,
        lastName: String,
        profile: String    
       },
     comments: [
         {
             type: Schema.Types.ObjectId,
             ref: 'Comment'
         }
     ]  
 });

 module.exports = Post = mongoose.model('Post',PostSchema);