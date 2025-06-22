import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./style.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post("https://blog-app-1-server.vercel.app/forgot-password", {
        email,
        securityAnswer,
        newPassword,
      })
      .then((res) => {
        setMessage(res.data.message);
        setTimeout(() => navigate("/login"), 2000);
      })
      .catch((err) => {
        setMessage(err.response?.data?.message || "Error resetting password");
      });
  };

  return (
    <form className="register_form" onSubmit={handleSubmit}>
      <h2 className="register_title">Forgot Password</h2>
      <div className="register_input_group">
        <input
          className="register_input"
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="register_input_group">
        <input
          className="register_input"
          type="text"
          placeholder="Who is your favorite author?"
          required
          onChange={(e) => setSecurityAnswer(e.target.value)}
        />
      </div>
      <div className="register_input_group">
        <input
          className="register_input"
          type="password"
          placeholder="New Password"
          required
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <button className="register_btn" type="submit">
        Reset Password
      </button>
      <div className="register_message">{message}</div>
    </form>
  );
}

export default ForgotPassword;
