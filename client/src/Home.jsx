import { React, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import moment from "moment";
import { userContext } from "./App";
import { useContext } from "react";

function Home() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState("");
  // const { user: currentUser } = useContext(userContext);
  // const { user, setUser } = useContext(userContext);

  // Fetch posts and current user
  useEffect(() => {
    // axios
    // .get("https://blog-app-1-server.vercel.app/getposts")
    // .then((res) => {
    //   const updatedPosts = res.data.map((post) => ({
    //     ...post,
    //     createdAt:
    //       post.createdAt ||
    //       new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Default to 3 days ago if missing
    //   }));
    //   setPosts(updatedPosts);
    // })
    // .catch((err) => console.log(err));

    axios
      .get("https://blog-app-1-server.vercel.app/getposts")
      .then((res) => setPosts(res.data))
      .catch((err) => console.log(err));

    axios
      .get("https://blog-app-1-server.vercel.app/", { withCredentials: true })
      .then((res) => setCurrentUser(res.data.username))
      .catch((err) => console.log(err));
    // axios
    //   .get("https://blog-app-1-server.vercel.app/", { withCredentials: true })
    //   .then((res) => {
    //     if (res.data.username) {
    //       // setCurrentUser(res.data.username);
    //       setUser({ username: res.data.username });
    //     } else {
    //       // setCurrentUser({});
    //       setUser({});
    //     }
    //   })
    //   .catch(() => setCurrentUser({})); // Ensure it resets on failure
  }, []);

  const getDuration = (createdAt) => {
    if (!createdAt) return "Unknown";
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now - createdDate) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div className="posts_container">
      {posts.map((post) => {
        return (
          <Link to={`/post/${post._id}`} key={post._id} className="post">
            {post.file && <img src={post.file} alt={post.title} />}
            <div className="post_text">
              <h2>{post.title}</h2>
              <p>{post.description}</p>
              <p className="posted_by">
                Posted by{" "}
                {currentUser === post.username ? "You" : post.username}
                {/* {user && user === post.username ? "You" : post.username} */}
              </p>
              <p className="timestamp">{moment(post.createdAt).fromNow()}</p>
              {/* <p className="timestamp">
                Created: {getDuration(post.createdAt)}
              </p> */}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default Home;
