import { React, useContext } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import "./style.css";
import { userContext } from "./App";
import axios from "axios";

function Navbar() {
  // const user = useContext(userContext); // get user from context
  const { user, setUser, setSessionExpired } = useContext(userContext); // Destructure user & setUser at once
  const navigate = useNavigate();

  // const handleLogout = () => {
  //   axios
  //     .get("https://blog-app-1-server.vercel.app/logout", {
  //       withCredentials: true,
  //     })
  //     .then((res) => {
  //       localStorage.removeItem("token");
  //       sessionStorage.removeItem("token");
  //       setUser({}); // Clear user state
  //       navigate("/"); // Redirect home
  //       console.log(res.data);
  //     })
  //     .catch((err) => console.log(err));
  // };

  const handleLogout = () => {
    axios
      .get("https://blog-app-1-server.vercel.app/logout", {
        withCredentials: true,
      })
      .then((res) => {
        localStorage.setItem("justLoggedOut", "true"); // Set flag
        setUser({});
        setSessionExpired(true); // Mark session as expired/logged out
        navigate("/");
        console.log(res.data);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="navbar-header">
      <div>
        <h3>Blog App</h3>
      </div>
      <div>
        <NavLink className="link" to="/" end>
          Home
        </NavLink>
        {user.username ? (
          <NavLink className="link" to="/create">
            Create
          </NavLink>
        ) : (
          <></>
        )}
        {user.username && (
          <NavLink className="link" to="/myposts">
            My Posts
          </NavLink>
        )}
        {/* <a className="link" href="">
          Contact
        </a> */}
        <NavLink className="link" to="/contact">
          Contact
        </NavLink>
      </div>
      {/* {user.username && (
        <Link className="link" to="/myposts">
          My Posts
        </Link>
      )} */}
      {user.username ? (
        <div>
          <input
            className="btn_input"
            onClick={handleLogout}
            type="button"
            value="Logout"
          ></input>
        </div>
      ) : (
        <div className="login_register">
          <NavLink to="/register" className="link">
            <h5>Register</h5>
          </NavLink>
          <NavLink to="/login" className="link">
            <h5>Login</h5>
          </NavLink>
        </div>
      )}
    </div>
  );
}

export default Navbar;
