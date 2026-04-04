const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    content: String,
    category: String, 
    createdAt: { type: Date, default: Date.now },
    likes:[{
      type: mongoose.Schema.Types.ObjectId, ref: "user"   
    }]
});

module.exports = mongoose.model('post', postSchema);