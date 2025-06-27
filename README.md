# MERN Blog App

A full-stack blog application built with the MERN stack. Users can register, log in, create, edit, and delete posts with image uploads, like and comment on posts, and manage their own content. The app features JWT authentication, session management with auto-expiry and renewal, and a responsive UI.

Live App: [Blog App](https://blog-app-1-client.vercel.app/)

---

## Features

- User Registration & Login (JWT Authentication, Secure Cookies)
- Forgot Password with Security Question
- Session Expiry Alerts & "Stay Logged In" Prompt
- Create, Read, Update, and Delete (CRUD) blog posts
- Image Upload for posts (Cloudinary + Multer)
- Like & Comment system (with upvote/downvote)
- View only your own posts ("My Posts" profile page)
- Protected Routes (Only logged-in users can create, edit, or delete posts/comments)
- Pagination and Sorting for posts
- Responsive UI with custom CSS
- User Authentication managed with React Context API
- SweetAlert2 for user-friendly alerts and prompts

---

## Tech Stack

### Frontend

- React.js (with Vite)
- React Router
- Context API
- Axios
- SweetAlert2
- Moment.js
- Bulma CSS
- Custom CSS

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer (File Upload Middleware)
- Cloudinary (Image Hosting)
- Cors
- bcrypt

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/blog-app.git
cd blog-app
```

---

### 2. Backend Setup

Go to the **server** folder:

```bash
cd server
```

Install dependencies:

```bash
npm install
```

Create a **.env** file in the server folder with the following:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
```

Start the backend:

```bash
node index.js
```

---

### 3. Frontend Setup

Go to the **client** folder:

```bash
cd client
```

Install dependencies:

```bash
npm install
```

Start the frontend:

```bash
npm run dev
```

---

## API Endpoints

| Method | Endpoint              | Description                        |
| ------ | --------------------- | ---------------------------------- |
| POST   | /register             | Register User                      |
| POST   | /login                | Login User                         |
| POST   | /create               | Create Post                        |
| GET    | /getposts             | Get All Posts                      |
| GET    | /getpostbyid/:id      | Get Post by ID                     |
| PUT    | /editpost/:id         | Edit Post                          |
| DELETE | /deletepost/:id       | Delete Post                        |
| GET    | /logout               | Logout User                        |
| GET    | /myposts              | Get Posts by Logged-in User        |
| POST   | /forgot-password      | Reset Password via Security Answer |
| GET    | /refresh-session      | Extend Session (Stay Logged In)    |
| PUT    | /upvote-comment/:id   | Upvote a Comment                   |
| PUT    | /downvote-comment/:id | Downvote a                         |

---

## How to Use

1. **Register** with your email, password, and security answer.
2. **Login** to access the app.
3. **Create** new blog posts with image uploads.
4. **View** all posts on the home page or filter to "My Posts".
5. **Like, comment, edit, or delete** your own posts and comments.
6. **Session Expiry:** Get notified when your session is about to expire and choose to stay logged in.
7. **Forgot Password:** Reset your password by answering your security question.

---

## Future Improvements 🚀

- Profile picture upload
- User role system (Admin/User)
- Advanced search and filtering
- Real-time notifications
- Rich text editor for posts

---

## Dependencies

| Package     | Version |
| ----------- | ------- |
| React       | 18.x    |
| Express     | 4.x     |
| MongoDB     | 6.x     |
| Axios       | 1.x     |
| Multer      | 1.x     |
| JWT         | 8.x     |
| SweetAlert2 | 11.x    |
| Cloudinary  | 1.x     |
| bcrypt      | 5.x     |
| Moment.js   | 2.x     |

---

## How to Contribute

1. Fork the repository 🍴
2. Create your feature branch:

```bash
git checkout -b feature/YourFeature
```

3. Commit your changes:

```bash
git commit -m "Add your message"
```

4. Push to the branch:

```bash
git push origin feature/YourFeature
```

5. Open a Pull Request 🔥

---

## License

MIT

---
