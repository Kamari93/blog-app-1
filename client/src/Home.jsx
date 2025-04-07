import { React, useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import moment from "moment";
import { userContext } from "./App";

function Home() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(4); // Adjust number of posts per page
  const [sortOrder, setSortOrder] = useState("newest"); // Sorting state

  const { user } = useContext(userContext); // Get user from global context
  console.log(`User: ${user?.username}`);
  console.log(`Current User: ${user?._id}`);

  // Fetch posts when user logs in/out
  useEffect(() => {
    axios
      .get("https://blog-app-1-server.vercel.app/getposts")
      .then((res) => setPosts(res.data))
      .catch((err) => console.log(err));
  }, [user]); // Re-fetch posts when `user` changes

  // Sort posts by createdAt
  // const sortedPosts = [...posts].sort((a, b) => {
  //   return sortOrder === "newest"
  //     ? new Date(b.createdAt) - new Date(a.createdAt)
  //     : new Date(a.createdAt) - new Date(b.createdAt);
  // });

  // Sort posts by createdAt or number of likes
  const sortedPosts = [...posts].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortOrder === "oldest") {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (sortOrder === "popular") {
      return (b.likes?.length || 0) - (a.likes?.length || 0); // Sort by number of likes
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

  const toggleLike = async (postId) => {
    if (!user?.username) return alert("You must be logged in to like posts!");

    console.log("Toggling like for:", postId);
    console.log("User ID:", user?._id);

    try {
      const res = await axios.put(
        `https://blog-app-1-server.vercel.app/togglelike/${postId}`,
        { _id: user?._id }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: Array.isArray(res.data.likes)
                  ? res.data.likes.filter((like) => like !== null)
                  : [],
              }
            : post
        )
      );
    } catch (error) {
      console.log("Error liking post", error);
    }
  };

  return (
    <div className="posts_container">
      <label for="sort">Sort By:</label>
      <select
        id="sort"
        class="sort-dropdown"
        onChange={(e) => setSortOrder(e.target.value)}
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="popular">Most Popular</option>
      </select>

      {currentPosts.map((post) => (
        <div key={post._id} className="post_card">
          <Link to={`/post/${post._id}`} className="post">
            {post.file && <img src={post.file} alt={post.title} />}
            <div className="post_text">
              <h2>{post.title}</h2>
              {/* <p>{post.description}</p> */}
              <div className="post_description">{post.description}</div>
              <p className="posted_by">
                Posted by{" "}
                {user?.username === post.username ? "You" : post.username}
              </p>
              <p className="timestamp">{moment(post.createdAt).fromNow()}</p>
            </div>
          </Link>

          {/* only show button if user is logged in */}
          <button
            onClick={() => toggleLike(post._id)}
            disabled={!user?.username}
            className="upvote"
          >
            {Array.isArray(post.likes) &&
            post.likes.some(
              (like) => like?.toString() === user?._id?.toString()
            )
              ? "Unlike"
              : "Like"}{" "}
            ({Array.isArray(post.likes) ? post.likes.length : 0})
          </button>
          {/* {console.log(post.likes)} */}
        </div>
      ))}

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

export default Home;
