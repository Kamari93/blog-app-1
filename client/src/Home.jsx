import { React, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import moment from "moment";

function Home() {
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch posts and current user
  useEffect(() => {
    axios;
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
  }, []);

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
              </p>
              <p className="timestamp">{moment(post.createdAt).fromNow()}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default Home;
