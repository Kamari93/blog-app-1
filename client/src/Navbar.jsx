import { React, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./style.css";
import { userContext } from "./App";
import axios from "axios";
import { set } from "mongoose";

function Navbar() {
  // const user = useContext(userContext); // get user from context
  const { user, setUser } = useContext(userContext); // Destructure user & setUser at once
  const navigate = useNavigate();

  // axios.defaults.withCredentials = true;

  // const { setUser } = useContext(userContext); // Get setUser from context

  // const handleLogout = () => {
  //   axios
  //     .get("https://blog-app-1-server.vercel.app/logout")
  //     .then((res) => {
  //       if (res.data === "Logout successful") {
  //         // navigate(0); // reload the page
  //         // window.location.reload(); // Force Navbar to reset
  //         setUser({}); // Reset user state
  //         navigate("/");
  //         console.log(res.data);
  //         console.log(user);
  //       }
  //     })
  //     .catch((err) => console.log(err));
  // };

  const handleLogout = () => {
    axios
      .get("https://blog-app-1-server.vercel.app/logout", {
        withCredentials: true,
      })
      .then(() => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("token");
        // setUser({}); // Clear user state
        setUser(null);
        navigate("/"); // Redirect home
        window.location.reload(); // Force Navbar to reset
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
        <div>
          <Link to="/register" className="link">
            <h5>Register/Login</h5>
          </Link>
        </div>
      )}
    </div>
  );
}

export default Navbar;
