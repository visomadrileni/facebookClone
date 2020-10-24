 const mongoose = require('mongoose');

 const connectDb = async () => {
     try {
         await mongoose.connect(process.env.mongoURI,{
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false
         });

         console.log('MongoDb is connected')
     } catch(err){
         console.log(err.message)
         process.exit(1)
     }
 }

 module.exports = connectDb;