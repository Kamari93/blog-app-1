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
    if (!commentText.trim()) return; // Prevent empty comments
    if (!user || !user._id || !user.username) {
      console.log("User not logged in or missing required fields.");
      return;
    }

    axios
      .post("https://blog-app-1-server.vercel.app/addcomment", {
        text: commentText,
        post: id,
        user: user._id,
        // postId: id, // `id` is from `useParams()`
        // userId: user._id,
        username: user.username,
      })
      .then((res) => {
        setComments([...comments, res.data]); // Append new comment
        setCommentText(""); // Clear input field
      })
      .catch((err) => console.log("Error adding comment:", err));
    console.log(commentText, id, user._id, user.username);
  };

  const handleEditComment = (commentId, newText) => {
    axios
      .put(`https://blog-app-1-server.vercel.app/editcomment/${commentId}`, {
        text: newText,
      })
      .then((res) => {
        setComments(comments.map((c) => (c._id === commentId ? res.data : c)));
      })
      .catch((err) => console.log("Error editing comment:", err));
  };

  const handleDeleteComment = (commentId) => {
    axios
      .delete(`https://blog-app-1-server.vercel.app/deletecomment/${commentId}`)
      .then(() => {
        setComments(comments.filter((c) => c._id !== commentId));
      })
      .catch((err) => console.log("Error deleting comment:", err));
  };

  const handleVote = async (commentId, type) => {
    if (!user) {
      alert("You must be logged in to vote.");
      return;
    }

    axios
      .put(`https://blog-app-1-server.vercel.app/${type}-comment/${commentId}`)
      .then((res) => {
        setComments(comments.map((c) => (c._id === commentId ? res.data : c)));
      })
      .catch((err) => console.log("Error voting:", err));
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
        <h3>Comments {comments.length > 0 && `(${comments.length})`}</h3>
        <div className="comments_scroll">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="comment">
                <strong>{comment.user.username}:</strong> {comment.text}
                {user._id === comment.user._id && ( // Only show options if user owns comment
                  <div>
                    <button
                      onClick={() =>
                        handleEditComment(
                          comment._id,
                          prompt("Edit comment:", comment.text)
                        )
                      }
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDeleteComment(comment._id)}>
                      Delete
                    </button>
                  </div>
                )}
                <div>
                  <button
                    onClick={() => {
                      if (user.username) {
                        handleVote(comment._id, "upvote");
                      } else {
                        alert("Please log in to upvote.");
                      }
                    }}
                  >
                    ⬆ {comment.upvotes.length}
                  </button>

                  <button
                    onClick={() => {
                      if (user.username) {
                        handleVote(comment._id, "downvote");
                      } else {
                        alert("Please log in to downvote.");
                      }
                    }}
                  >
                    ⬇ {comment.downvotes.length}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
        </div>
      </div>
      {user.username ? (
        <div className="add_comment">
          <textarea
            maxLength={250}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Leave a comment..."
          />
          <button onClick={handleAddComment}>Post</button>
          {/* <button onClick={(e) => handleAddComment(post._id)}>Post</button> */}
        </div>
      ) : (
        <p>Log in to leave a comment.</p>
      )}
    </div>
  );
}

export default Post;
