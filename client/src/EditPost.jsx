import { React, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";

function EditPost() {
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const { id } = useParams();
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .put("http://localhost:5000/editpost/" + id, { title, description })
      .then((res) => {
        console.log(res);
        if (res.data === "Post updated successfully") {
          navigate("/");
        }
      })
      .catch((err) => console.log(err));
  };

  // use useEffect to fetch the post record
  useEffect(() => {
    axios
      .get("https://blog-app-1-server.vercel.app/getpostbyid/" + id)
      .then((result) => {
        setTitle(result.data.title);
        setDescription(result.data.description);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="post_container">
      <div className="post_form">
        <form onSubmit={handleSubmit}>
          <h2>Update Post</h2>
          <input
            type="text"
            placeholder="Enter Title"
            onChange={(e) => setTitle(e.target.value)}
            value={title}
          ></input>
          <textarea
            name="desc"
            id="desc"
            cols="30"
            rows="10"
            placeholder="Enter Description"
            onChange={(e) => setDescription(e.target.value)}
            value={description}
          ></textarea>
          <button>Update</button>
        </form>
      </div>
    </div>
  );
}

export default EditPost;
