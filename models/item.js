const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
  image: String,
  description: String,
  title:String,
  price:Number,
  contact: String,
  email:String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("item", itemSchema);