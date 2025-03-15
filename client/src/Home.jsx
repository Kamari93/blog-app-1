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

  // Fetch posts when user logs in/out
  useEffect(() => {
    axios
      .get("https://blog-app-1-server.vercel.app/getposts")
      .then((res) => setPosts(res.data))
      .catch((err) => console.log(err));
  }, [user]); // Re-fetch posts when `user` changes

  // Sort posts by createdAt
  const sortedPosts = [...posts].sort((a, b) => {
    return sortOrder === "newest"
      ? new Date(b.createdAt) - new Date(a.createdAt)
      : new Date(a.createdAt) - new Date(b.createdAt);
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

  // Handle like/unlike toggle
  const toggleLike = async (postId) => {
    if (!user?.username) return alert("You must be logged in to like posts!");

    try {
      const res = await axios.put(
        `https://blog-app-1-server.vercel.app/togglelike/${postId}`,
        { userId: user._id }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post._id === postId ? { ...post, likes: res.data.likes } : post
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
              <p>{post.description}</p>
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
            {/* {post.likes?.includes(user?._id) ? "Unlike" : "Like"} (
            {post.likes?.length || 0}) */}
            {post.likes?.some(
              (like) => like.toString() === user?._id.toString()
            )
              ? "Unlike"
              : "Like"}{" "}
            ({post.likes?.length || 0})
          </button>
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

// import { React, useEffect, useState } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import moment from "moment";
// import { userContext } from "./App";
// import { useContext } from "react";

// function Home() {
//   const [posts, setPosts] = useState([]);
//   const [currentUser, setCurrentUser] = useState("");
//   // const { user: currentUser } = useContext(userContext);
//   // const { user, setUser } = useContext(userContext);

//   // Fetch posts and current user
//   useEffect(() => {
//     // axios
//     // .get("https://blog-app-1-server.vercel.app/getposts")
//     // .then((res) => {
//     //   const updatedPosts = res.data.map((post) => ({
//     //     ...post,
//     //     createdAt:
//     //       post.createdAt ||
//     //       new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // Default to 3 days ago if missing
//     //   }));
//     //   setPosts(updatedPosts);
//     // })
//     // .catch((err) => console.log(err));

//     axios
//       .get("https://blog-app-1-server.vercel.app/getposts")
//       .then((res) => setPosts(res.data))
//       .catch((err) => console.log(err));

//     axios
//       .get("https://blog-app-1-server.vercel.app/", { withCredentials: true })
//       .then((res) => setCurrentUser(res.data.username))
//       .catch((err) => console.log(err));
//     // axios
//     //   .get("https://blog-app-1-server.vercel.app/", { withCredentials: true })
//     //   .then((res) => {
//     //     if (res.data.username) {
//     //       // setCurrentUser(res.data.username);
//     //       setUser({ username: res.data.username });
//     //     } else {
//     //       // setCurrentUser({});
//     //       setUser({});
//     //     }
//     //   })
//     //   .catch(() => setCurrentUser({})); // Ensure it resets on failure
//   }, [currentUser]);

//   const getDuration = (createdAt) => {
//     if (!createdAt) return "Unknown";
//     const createdDate = new Date(createdAt);
//     const now = new Date();
//     const diffInSeconds = Math.floor((now - createdDate) / 1000);

//     if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
//     if (diffInSeconds < 3600)
//       return `${Math.floor(diffInSeconds / 60)} minutes ago`;
//     if (diffInSeconds < 86400)
//       return `${Math.floor(diffInSeconds / 3600)} hours ago`;
//     return `${Math.floor(diffInSeconds / 86400)} days ago`;
//   };

//   return (
//     <div className="posts_container">
//       {posts.map((post) => {
//         return (
//           <Link to={`/post/${post._id}`} key={post._id} className="post">
//             {post.file && <img src={post.file} alt={post.title} />}
//             <div className="post_text">
//               <h2>{post.title}</h2>
//               <p>{post.description}</p>
//               <p className="posted_by">
//                 Posted by{" "}
//                 {currentUser === post.username ? "You" : post.username}
//                 {/* {user && user === post.username ? "You" : post.username} */}
//               </p>
//               <p className="timestamp">{moment(post.createdAt).fromNow()}</p>
//               {/* <p className="timestamp">
//                 Created: {getDuration(post.createdAt)}
//               </p> */}
//             </div>
//           </Link>
//         );
//       })}
//     </div>
//   );
// }

// export default Home;
