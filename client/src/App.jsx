import { useState, createContext, useEffect } from "react"; // createContext is used to create a global state
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Register from "./Register";
import Login from "./Login";
import Home from "./Home";
import CreatePost from "./CreatePost";
import Post from "./Post";
import EditPost from "./EditPost";
import Contact from "./Contact";
import axios from "axios";

export const userContext = createContext(); // create a global state

function App() {
  const [user, setUser] = useState({});

  axios.defaults.withCredentials = true;
  useEffect(() => {
    axios
      .get("http://localhost:5000/")
      .then((user) => {
        // console.log(user);
        setUser(user.data);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <userContext.Provider value={user}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/create" element={<CreatePost />} />
          <Route path="/post/:id" element={<Post />} />
          <Route path="/editpost/:id" element={<EditPost />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </BrowserRouter>
    </userContext.Provider>
  );
}

export default App;
