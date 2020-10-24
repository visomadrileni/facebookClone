const multer = require('multer');

const storage = multer.diskStorage({  //disk storage engine gives us full control on storing files to disk
    filename: (req,file,callback) => {
        callback(null,Date.now() + file.originalname)
    }
})

const imageFilter = (req,file,callback) => { //We search any file that ends with .jpg or jpeg or png by using $ 
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/i)){
        return callback(new Error("Only image file are allows"),false)
    }
    callback(null,true)
}

const upload = multer({
    storage,
    fileFilter: imageFilter
})

module.exports = upload;