# CampusSync 🎓

A full-stack campus resource management web application built for college students to share knowledge, buy/sell resources, and stay updated with campus events.

## 🌐 Live Demo
[CampusSync on Render](https://campus-resource-manager-mhip.onrender.com)

## ✨ Features

- 🔐 **Authentication** — Secure JWT based login and registration
- 💬 **Discussion Zone** — Create posts, like, comment, and filter by category
- ✏️ **Post Management** — Edit and delete your own posts from your profile
- 🛒 **Marketplace** — Buy and sell campus resources with image uploads
- ✅ **Sold Out** — Mark your listed item as sold to remove it from marketplace
- 🤖 **AI Post Generator** — Generate discussion posts using Groq AI (LLaMA 3)
- 🤖 **AI Description Generator** — Auto generate item descriptions for marketplace
- 🔍 **Search** — Search marketplace items in real time
- 📱 **Responsive** — Works on mobile and desktop

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | EJS, Bootstrap 5, CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcrypt, cookies |
| AI | Groq API (LLaMA 3.3) |
| File Upload | Multer |
| Deployment | Render |

## 🚀 Getting Started
1. Clone the repo and run `npm install`
2. Add your `.env` file with `MONGODB_URI`, `JWT_SECRET`, `GROQ_API_KEY`
3. Run with `nodemon app.js`

## 📁 Project Structure

```
campussync/
├── models/
│   ├── user.js
│   ├── post.js
│   ├── item.js
│   └── comment.js
├── public/
│   └── style.css
├── views/
│   ├── index.ejs
│   ├── login.ejs
│   ├── discussion.ejs
│   ├── profile.ejs
│   ├── marketplace.ejs
│   ├── sell.ejs
│   ├── create.ejs
│   └── edit.ejs
├── app.js
├── .env
└── README.md
```
## 🤖 AI Features

CampusSync integrates **Groq AI (LLaMA 3.3)** for two features:
- **Discussion Post Generator** — Type a rough idea and AI expands it into a full post
- **Marketplace Description Generator** — Enter item title and AI writes an attractive description

## 👩‍💻 Author
Made by Priyanshi Bisht
