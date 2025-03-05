import { React, useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Home() {
  const [posts, setPosts] = useState([]);
  // in this context useEffect is used to get the data from the backend...useEffect is useful for fetching data
  useEffect(() => {
    axios
      .get("http://localhost:5000/getposts")
      .then((posts) => {
        setPosts(posts.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);
  return (
    <div className="posts_container">
      {posts.map((post) => {
        return (
          <Link to={`/post/${post._id}`} key={post._id} className="post">
            <img src={`http://localhost:5000/Images/${post.file}`} alt=""></img>
            <div className="post_text">
              <h2>{post.title}</h2>
              <p>{post.description}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default Home;
