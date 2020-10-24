 const mongoose = require('mongoose');
 const Schema = mongoose.Schema;

 const CommentSchema = new Schema({
     content: String,
     likes: Number,
     creator: {
         _id: {
             type: Schema.Types.ObjectId,
             ref: 'User'
             },
         firstName: String,
         lastName: String    
     }
 });

 module.exports = Comment = mongoose.model('Comment',CommentSchema);