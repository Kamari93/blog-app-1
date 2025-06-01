import { React, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
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
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
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
        <Link className="link" to="/">
          Home
        </Link>
        {user.username ? (
          <Link className="link" to="/create">
            Create
          </Link>
        ) : (
          <></>
        )}

        {/* <a className="link" href="">
          Contact
        </a> */}
        <Link className="link" to="/contact">
          Contact
        </Link>
      </div>
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
          <Link to="/register" className="link">
            <h5>Register</h5>
          </Link>
          <Link to="/login" className="link">
            <h5>Login</h5>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Navbar;
