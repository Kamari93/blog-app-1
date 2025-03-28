import { React, useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import axios from "axios";
import { userContext } from "./App";
import "./style.css";

function Post() {
  const { id } = useParams(); //extract the id from url
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
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

    axios
      .get("https://blog-app-1-server.vercel.app/getcomments/" + id)
      .then((res) => setComments(res.data))
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

  const handleAddComment = () => {
    axios
      .post("https://blog-app-1-server.vercel.app/addcomment", {
        text: commentText,
        postId: id,
      })
      .then(() => {
        setCommentText(""); // Clear input
        window.location.reload(); // Reload to show new comment
      })
      .catch((err) => console.log(err));
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
      <div className="comments_section">
        <h3>Comments</h3>
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="comment">
              <strong>{comment.user.username}:</strong> {comment.text}
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
      </div>
      {user ? (
        <div className="add_comment">
          <textarea
            maxLength={250}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Leave a comment..."
          />
          <button onClick={handleAddComment}>Post</button>
        </div>
      ) : (
        <p>Log in to leave a comment.</p>
      )}
    </div>
  );
}

export default Post;
