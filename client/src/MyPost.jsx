import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import moment from "moment";
import { userContext } from "./App";
import "./style.css";

function MyPosts() {
  const { user } = useContext(userContext);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(4); // Same as Home
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    if (user?.username) {
      axios
        .get("https://blog-app-1-server.vercel.app/myposts", {
          withCredentials: true,
        })
        .then((res) => setPosts(res.data))
        .catch((err) => console.log(err));
    }
  }, [user]);

  if (!user?.username) {
    return (
      <div className="posts_container">Please log in to view your posts.</div>
    );
  }

  // Sort posts
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortOrder === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortOrder === "popular") {
      return (b.likes?.length || 0) - (a.likes?.length || 0);
    }
    return 0;
  });

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = sortedPosts.slice(indexOfFirstPost, indexOfLastPost);

  const nextPage = () => {
    if (currentPage < Math.ceil(posts.length / postsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="posts_container">
      <label htmlFor="sort">Sort By:</label>
      <select
        id="sort"
        className="sort-dropdown"
        onChange={(e) => setSortOrder(e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="popular">Most Popular</option>
      </select>

      {currentPosts.length === 0 ? (
        <p>You haven't created any posts yet.</p>
      ) : (
        currentPosts.map((post) => (
          <div key={post._id} className="post_card">
            <Link to={`/post/${post._id}`} className="post">
              {post.file && <img src={post.file} alt={post.title} />}
              <div className="post_text">
                <h2>{post.title}</h2>
                <div className="post_description">{post.description}</div>
                <p className="posted_by">Posted by You</p>
                <p className="timestamp">{moment(post.createdAt).fromNow()}</p>
              </div>
            </Link>
            <div>
              <span>
                Likes: {Array.isArray(post.likes) ? post.likes.length : 0}
              </span>
            </div>
          </div>
        ))
      )}

      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span> Page {currentPage} </span>
        <button
          onClick={nextPage}
          disabled={currentPage >= Math.ceil(posts.length / postsPerPage)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default MyPosts;
