import { React, useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { userContext } from "./App";
import "./style.css";

function Post() {
  const { id } = useParams(); //extract the id from url
  const [post, setPost] = useState({});
  const navigate = useNavigate();
  // const user = useContext(userContext);
  const { user, setUser } = useContext(userContext); // Destructure user & setUser at once

  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios
      .get("https://blog-app-1-server.vercel.app/getpostbyid/" + id)
      .then((result) => {
        setPost(result.data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleDelete = (id) => {
    axios
      .delete("https://blog-app-1-server.vercel.app/deletepost/" + id)
      .then((result) => {
        // window.location.reload();
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div className="posts_container">
      <div className="post_post">
        {/* <img
          src={`https://blog-app-1-server.vercel.app/Images/${post.file}`}
          alt=""
        ></img> */}
        {post.file && <img src={post.file} alt={post.title} />}
        <h1>{post.title}</h1>
        <p>{post.description}</p>
        <div className="post_actions">
          {user.email === post.email ? (
            <>
              <Link to={`/editpost/${post._id}`} className="post_action_edit">
                Edit
              </Link>
              <button
                onClick={(e) => {
                  handleDelete(post._id);
                }}
                className="post_action_delete"
              >
                Delete
              </button>{" "}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}

export default Post;
