import { React, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./style.css";

function EditPost() {
  const [title, setTitle] = useState();
  const [description, setDescription] = useState();
  const [file, setFile] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  axios.defaults.withCredentials = true;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (file) {
      formData.append("file", file);
    }

    try {
      const res = await axios.put(
        `https://blog-app-1-server.vercel.app/editpost/${id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.message === "Post updated successfully") {
        // navigate("/");
        navigate(`/post/${id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    axios
      .get(`https://blog-app-1-server.vercel.app/getpostbyid/${id}`)
      .then((result) => {
        setTitle(result.data.title);
        setDescription(result.data.description);
      })
      .catch((err) => console.log(err));
  }, [id]);

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
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button>Update</button>
        </form>
      </div>
    </div>
  );
}

export default EditPost;
