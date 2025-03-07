import { React, useState, useContext } from "react";
import axios from "axios";
import "./style.css";
import { userContext } from "./App";
function CreatePost() {
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [file, setFile] = useState();
  // const user = useContext(userContext); // get user from context
  const { user, setUser } = useContext(userContext); // Destructure user & setUser at once
  axios.defaults.withCredentials = true;

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   const formData = new FormData(); // used for file upload and post data
  //   formData.append("title", title);
  //   formData.append("description", description);
  //   formData.append("email", user.email);
  //   formData.append("file", file);
  //   axios
  //     .post("https://blog-app-1-server.vercel.app/create", formData)
  //     .then((res) => {
  //       console.log(res);
  //       if (res.data === "Post created successfully") {
  //         //   navigate("/");
  //         window.location.href = "/"; // reload the page
  //       }
  //     })
  //     .catch((err) => console.log(err));
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description) {
      alert("Title and description are required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("email", user.email);

    // Append file **only if** user selected one
    if (file) {
      formData.append("file", file);
    }

    try {
      const res = await axios.post(
        "https://blog-app-1-server.vercel.app/create",
        formData
      );
      console.log(res);
      if (res.data === "Post created successfully") {
        alert("Post created successfully");
        setTitle("");
        setDescription("");
        setFile(null); // Reset file state
        window.location.href = "/"; // Refresh the page
      }
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Something went wrong, please try again");
    }
  };

  return (
    <div className="post_container">
      <div className="post_form">
        <form onSubmit={handleSubmit}>
          <h2>Create Post</h2>
          <input
            type="text"
            placeholder="Enter Title"
            onChange={(e) => setTitle(e.target.value)}
          ></input>
          <textarea
            name="desc"
            id="desc"
            cols="30"
            rows="10"
            placeholder="Enter Description"
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
          <input
            className="file"
            type="file"
            accept="image/*"
            placeholder="Select file"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button>Post</button>
        </form>
      </div>
    </div>
  );
}

export default CreatePost;
