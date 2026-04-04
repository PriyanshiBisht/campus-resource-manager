const mongoose=require('mongoose');

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("DB connected"))
.catch(err => console.log(err));
 const userSchema=mongoose.Schema({
    username:String,
    email:String,
    password:String,
    posts:[
        {
            type:mongoose.Schema.Types.ObjectId,ref:"post"
        }
    ]
})
 module.exports = mongoose.model('user',userSchema);