import { React, useState, useEffect, useContext } from "react";
import "./style.css";
import { Link, useNavigate } from "react-router-dom";
import { userContext } from "./App";
import axios from "axios";

function Login() {
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const navigate = useNavigate();
  // const user = useContext(userContext); // Import the context

  axios.defaults.withCredentials = true;

  const { setUser } = useContext(userContext); // Get setUser from context
  const handleLogin = (e) => {
    e.preventDefault();
    axios
      .post("https://blog-app-1-server.vercel.app/login", { email, password })
      .then((res) => {
        console.log(res);
        if (res.data.message === "Login successful") {
          // window.location.reload(); // Force re-render
          // window.location.href = "/"; // reload the page
          // setUser(res.data); // update the user state after login
          setUser({
            ...res.data,
            sessionExpiresAt: res.data.sessionExpiresAt, // Store expiry
          });
          console.log(res.data);
          // console.log(user);
          navigate("/");
        }
      })
      .catch((err) => console.log(err));
  };
  return (
    <div className="signup_container">
      <div className="signup_form">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              placeholder="Enter Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              placeholder="*******"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="signup_btn">Login</button>
        </form>
        <br></br>
        <p>Don't have an account?</p>
        <Link to="/register">
          <button>Signup</button>
        </Link>
        <br></br>
        <p>Forgot Password?</p>
        <Link to="/forgotpassword">
          <button style={{ marginTop: "15px" }}>Forgot Password?</button>
        </Link>
      </div>
    </div>
  );
}

export default Login;
