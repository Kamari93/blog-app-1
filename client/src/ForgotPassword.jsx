import { useState } from "react";
import "./style.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
    <div className="signup_container">
      <div className="signup_form">
        <h2>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input
              className="register_input"
              type="email"
              placeholder="Enter Email"
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="securityAnswer">Who is your favorite author?</label>
            <input
              className="register_input"
              type="text"
              placeholder="Enter your answer"
              required
              onChange={(e) => setSecurityAnswer(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="newPassword">New Password</label>
            <input
              className="register_input"
              type="password"
              placeholder="New Password"
              required
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button className="signup_btn" type="submit">
            Reset Password
          </button>
        </form>
        <div className="register_message">{message}</div>
      </div>
    </div>
  );
}

export default ForgotPassword;
