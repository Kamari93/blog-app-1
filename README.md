# MERN Blog App

This is a Blog App built using the MERN stack. The app allows users to register, login, create posts, edit posts, delete posts, and view all posts with image uploads.

Live App: blog-app-1-client.vercel.app

## Features

- User Registration & Login (with JWT Authentication)
- Create, Read, Update, and Delete (CRUD) blog posts
- Image Upload for posts
- Protected Routes (Only logged-in users can create or edit posts)
- File Upload using **Multer**
- MongoDB Database Integration
- User Authentication with Context API
- Responsive UI with CSS

---

## Tech Stack

### Frontend

- React.js
- React Router
- Context API
- Axios
- Vite
- Bulma CSS (optional)

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer (File Upload Middleware)
- Cors

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

| Method | Endpoint         | Description    |
| ------ | ---------------- | -------------- |
| POST   | /register        | Register User  |
| POST   | /login           | Login User     |
| POST   | /create          | Create Post    |
| GET    | /getposts        | Get All Posts  |
| GET    | /getpostbyid/:id | Get Post by ID |
| PUT    | /editpost/:id    | Edit Post      |
| DELETE | /deletepost/:id  | Delete Post    |
| GET    | /logout          | Logout User    |

---

## How to Use

1. **Register** with your email and password.
2. **Login** to access the app.
3. Create new blog posts with **image uploads**.
4. View all posts on the home page.
5. Edit or delete your own posts.

---

## Future Improvements 🚀

- Pagination for posts
- Search functionality
- Like & Comment system
- Profile Picture Upload
- User Role System (Admin/User)

---

## Dependencies

| Package | Version |
| ------- | ------- |
| React   | 18.x    |
| Express | 4.x     |
| MongoDB | 6.x     |
| Axios   | 1.x     |
| Multer  | 1.x     |
| JWT     | 8.x     |

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
