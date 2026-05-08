const cookieParser = require('cookie-parser');
const express = require('express');
const app = express();
require("dotenv").config();
const Groq = require("groq-sdk");
const userModel = require("./models/user");
const postModel = require("./models/post");
const itemModel = require("./models/item");
const commentModel = require("./models/comment");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "campussync",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
});

const upload = multer({ storage });
app.set("view engine","ejs");
const path = require("path");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
const bcrypt = require('bcrypt');
const jwt = require ('jsonwebtoken');
app.get('/',(req,res)=>{
    res.render("index");
});
app.get('/login',(req,res)=>{
    res.render("login");
});
app.get('/create',(req,res)=>{
    res.render("create");
});
app.get('/sell',(req,res)=>{
    res.render("sell");
});
app.get("/profile", isLoggedIn, async (req, res) => {

    let user = await userModel.findById(req.user.userid);

    let myPosts = await postModel.find({ 
        user: req.user.userid  
    }).populate("user");

    res.render("profile", { myPosts, user });
});
app.get("/like/:id",isLoggedIn,async(req,res)=>{
let post= await postModel.findOne({  _id:req.params.id }).populate("user");
if(post.likes.indexOf(req.user.userid)===-1){
post.likes.push(req.user.userid);
}
else{
    post.likes.splice(post.likes.indexOf(req.user.userid),1);
}
 await post.save(); 
 res.json({ liked: post.likes.includes(req.user.userid), likesCount: post.likes.length });
});
app.get("/delete/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findById(req.params.id);

  if (!post) return res.send("Post not found");

  if (post.user.toString() !== req.user.userid.toString()) {
    return res.send("Unauthorized");
  }

  await postModel.findByIdAndDelete(req.params.id);
  res.redirect("/profile");
});
app.get("/edit/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findById(req.params.id);

  if (!post) return res.send("Post not found");
  if (post.user.toString() !== req.user.userid.toString()) {
    return res.send("Unauthorized");
  }

  res.render("edit", { post });
});
app.post("/edit/:id", isLoggedIn, async (req, res) => {
  let post = await postModel.findById(req.params.id);

  if (!post) return res.send("Post not found");

  if (post.user.toString() !== req.user.userid.toString()) {
    return res.send("Unauthorized");
  }

  await postModel.findByIdAndUpdate(req.params.id, {
    content: req.body.content,
    category: req.body.category
  });

  res.redirect("/profile");
});
app.get("/discussion", isLoggedIn, async (req, res) => {
  let filter = {};
  if (req.query.category) filter.category = req.query.category;
  let posts = await postModel.find(filter).populate("user").sort({ createdAt: -1 });
  let allPosts = await postModel.find();
  let counts = {
    all: allPosts.length,
    internship: allPosts.filter(p => p.category === "internship").length,
    events: allPosts.filter(p => p.category === "events").length,
    general: allPosts.filter(p => p.category === "general").length
  };
  let comments = await commentModel.find().populate("user").sort({ createdAt: 1 });
  
  res.render("discussion", { posts, user: req.user, selectedCategory: req.query.category || "", counts, comments });
});

app.post('/register', async(req,res)=>{
    let {email, password,username}=req.body;
    let user = await userModel.findOne({email});
    if(user)return res.status(500).send("user already registered");
    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async(err,hash)=>{
 let user = await userModel.create({
            username,
            email,
            password:hash
        });
        let token = jwt.sign({email:email,userid:user._id},"secret");
        res.cookie("token",token);
      res.redirect("/profile");
        })
     
    })

}); 
app.post('/login', async (req,res)=>{
let {email,password}=req.body;
    let user = await userModel.findOne({email});
    if(!user)return res.status(500).send("something went wrong");
    bcrypt.compare(password,user.password,function (err,result){
        if(result) { 
           
        let token = jwt.sign({email:email,userid:user._id},"secret");
        res.cookie("token",token);
         res.status(200).redirect("/profile");
    }
       else res.redirect("/login"); 
    })
});
app.get('/logout',(req,res)=>{
res.cookie("token","");
res.redirect("/login");
});
app.post("/create-post", isLoggedIn, async (req, res) => {
    let { content, category } = req.body;

    let user = await userModel.findOne({email:req.user.email});

    let post = await postModel.create({
        user: user._id,
        content,
        category
    });
user.posts.push(post._id);
await user.save();
    res.redirect("/discussion");
});
app.post("/sell", isLoggedIn, upload.single("image"), async (req, res) => {

  try {
    const { title, description, email, contact, price } = req.body;

    console.log(req.file); 

    await itemModel.create({
      user: req.user.userid,
      title,
      description,
      email,
      price,
      contact,
      image: req.file.path // ⭐ Cloudinary URL
    });

    res.redirect("/marketplace");

  } catch (err) {
    console.log(err);
    res.send("Error uploading item");
  }
});
app.get("/deleteitem/:id", isLoggedIn, async (req, res) => {
  await itemModel.findByIdAndDelete(req.params.id);
  res.redirect("/marketplace");
});
app.get("/marketplace", isLoggedIn, async (req, res) => {
  
const search = req.query.search || "";
const items = await itemModel.find(
  search ? { title: { $regex: search, $options: "i" } } : {}
).populate("user").sort({ createdAt: -1 });
const user = await userModel.findById(req.user.userid);
res.render("marketplace", { items, user, search });
});
app.post("/generate-post", isLoggedIn, async (req, res) => {
  const { idea } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const result = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: `You are a helpful assistant for a college campus app. A student has this rough idea for a discussion post: "${idea}". Write a clear, engaging, well-structured post in 3-4 sentences. Only return the post text, nothing else.` }]
  });
  res.json({ content: result.choices[0].message.content });
});
app.post("/generate-description", isLoggedIn, async (req, res) => {
  const { title } = req.body;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const result = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: `You are a helpful assistant for a college campus marketplace. A student is selling: "${title}". Write a short, attractive item description in 2-3 sentences for the listing. Only return the description text, nothing else.` }]
  });
  res.json({ content: result.choices[0].message.content });
});
app.post("/comment/:postId", isLoggedIn, async (req, res) => {
  const comment = await commentModel.create({
    content: req.body.content,
    user: req.user.userid,
    post: req.params.postId
  });
  res.redirect("/discussion");
});

app.get("/deletecomment/:id", isLoggedIn, async (req, res) => {
  await commentModel.findByIdAndDelete(req.params.id);
  res.redirect("/discussion");
});
function isLoggedIn(req, res, next) {
  res.setHeader("Cache-Control", "no-store");
    const token = req.cookies.token;

    if (!token) {
        return res.redirect("/"); 
    }

    try {
        const decoded = jwt.verify(token, "secret");
        req.user = decoded;
        next();
    } catch (err) {
        return res.redirect("/");
    }
}
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});