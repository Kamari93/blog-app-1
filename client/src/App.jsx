import { useState, createContext, useEffect } from "react"; // createContext is used to create a global state
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Register from "./Register";
import Login from "./Login";
import Home from "./Home";
import CreatePost from "./CreatePost";
import Post from "./Post";
import EditPost from "./EditPost";
import Contact from "./Contact";
import MyPosts from "./MyPost";
import ForgotPassword from "./ForgotPassword";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export const userContext = createContext(); // create a global state

function App() {
  const [user, setUser] = useState({});
  const [sessionExpired, setSessionExpired] = useState(false);
  // const [initialCheckDone, setInitialCheckDone] = useState(false);
  // const [wasPreviouslyLoggedIn, setWasPreviouslyLoggedIn] = useState(false);
  const [remainingTime, setRemainingTime] = useState(null);
  const [showWelcomeAlert, setShowWelcomeAlert] = useState(false);
  const [stayLoggedInPrompted, setStayLoggedInPrompted] = useState(false);
  const navigate = useNavigate(); // for redirection

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const pollSession = setInterval(() => {
      axios
        .get("https://blog-app-1-server.vercel.app/", { withCredentials: true })
        .catch((err) => {
          if (
            err.response?.status === 401 ||
            err.response?.data?.error === "Token is not valid"
          ) {
            setSessionExpired(true);
            setUser({});
          }
        });
    }, 60 * 1000); // every 1 minute

    return () => clearInterval(pollSession);
  }, []);

  // Timer for session expiry
  useEffect(() => {
    if (user && user.sessionExpiresAt) {
      const remaining = user.sessionExpiresAt - Date.now();
      if (remaining > 0) {
        const timer = setTimeout(() => {
          setSessionExpired(true);
          setUser({}); // <-- Immediately clear user state
        }, remaining);

        // Clean up timer if user logs out or sessionExpiresAt changes
        return () => clearTimeout(timer);
      } else {
        setSessionExpired(true);
        setUser({}); // <-- Immediately clear user state
      }
    }
  }, [user.sessionExpiresAt]);

  useEffect(() => {
    // Check for justLoggedOut flag
    if (localStorage.getItem("justLoggedOut") === "true") {
      localStorage.removeItem("justLoggedOut"); // Remove flag after use
      setUser({});
      setSessionExpired(true);
      return; // Skip session check this time
    }
    const checkSession = () => {
      axios
        .get("https://blog-app-1-server.vercel.app/")
        .then((res) => {
          if (res.data.username) {
            setUser({
              ...res.data,
              sessionExpiresAt: res.data.sessionExpiresAt, // Only use backend value
            });
            setSessionExpired(false);
          } else {
            setUser({});
            setSessionExpired(true);
            setShowWelcomeAlert(true); // Show welcome alert if not logged in
          }
        })
        .catch((err) => {
          setSessionExpired(true);
          setUser({});
          setShowWelcomeAlert(true); // Show welcome alert if not logged in
        });
    };

    checkSession();
    const interval = setInterval(checkSession, 10 * 60 * 1000); // 10 min
    return () => clearInterval(interval);
  }, []);

  // useEffect(() => {
  //   if (sessionExpired && user._id === undefined) {
  //     let confirm = window.confirm(
  //       "Please login/create an account for full access."
  //     );
  //     if (confirm) {
  //       navigate("/login");
  //     } else {
  //       navigate("/");
  //     }
  //     setUser({});
  //   }
  // }, [sessionExpired]);

  // useEffect(() => {
  //   if ((sessionExpired && user._id === undefined) || remainingTime === null) {
  //     Swal.fire({
  //       title: "Welcome 🍊🏁🌊",
  //       text: "Please Login or create an account for full access.",
  //       icon: "warning",
  //       showDenyButton: true,
  //       showCancelButton: true,
  //       confirmButtonText: "Login",
  //       denyButtonText: "Create Account",
  //       cancelButtonText: "Continue as Guest",
  //       customClass: {
  //         popup: "my-swal-popup",
  //         title: "my-swal-title",
  //         confirmButton: "my-swal-confirm",
  //         denyButton: "my-swal-deny",
  //         cancelButton: "my-swal-cancel",
  //       },
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         navigate("/login");
  //       } else if (result.isDenied) {
  //         navigate("/register");
  //       } else if (result.dismiss === Swal.DismissReason.cancel) {
  //         navigate("/");
  //       }
  //     });

  //     setUser({});
  //   }
  // }, [sessionExpired]);

  useEffect(() => {
    if (sessionExpired) {
      Swal.fire({
        title: "You're session has expired 🍊🏁🌊",
        text: "Please Login for full access or continue as a guest.",
        icon: "warning",
        // showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Login",
        // denyButtonText: "Create Account",
        cancelButtonText: "Continue as Guest",
        customClass: {
          popup: "my-swal-popup",
          title: "my-swal-title",
          confirmButton: "my-swal-confirm",
          // denyButton: "my-swal-deny",
          cancelButton: "my-swal-cancel",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          navigate("/");
        }
      });
    }
  }, [sessionExpired]);

  useEffect(() => {
    if (showWelcomeAlert) {
      Swal.fire({
        title: "Welcome 🍊🏁🌊",
        text: "Please Login or create an account for full access.",
        icon: "warning",
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Login",
        denyButtonText: "Create Account",
        cancelButtonText: "Continue as Guest",
        customClass: {
          popup: "my-swal-popup",
          title: "my-swal-title",
          confirmButton: "my-swal-confirm",
          denyButton: "my-swal-deny",
          cancelButton: "my-swal-cancel",
        },
      }).then((result) => {
        setShowWelcomeAlert(false); // Prevent repeated alerts
        if (result.isConfirmed) {
          navigate("/login");
        } else if (result.isDenied) {
          navigate("/register");
        }
        // Do nothing on cancel or dismiss: user stays on current page

        // else if (result.dismiss === Swal.DismissReason.cancel) {
        //   navigate("/");
        // }
      });
    }
  }, [showWelcomeAlert]);

  useEffect(() => {
    let interval;
    if (user && user.sessionExpiresAt) {
      interval = setInterval(() => {
        const remaining = user.sessionExpiresAt - Date.now();
        setRemainingTime(remaining > 0 ? remaining : 0);
      }, 1000);
    } else {
      setRemainingTime(null);
    }
    return () => clearInterval(interval);
  }, [user.sessionExpiresAt]);

  function formatTime(ms) {
    if (ms === null) return "";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  useEffect(() => {
    if (
      user &&
      user.sessionExpiresAt &&
      remainingTime !== null &&
      remainingTime <= 2 * 60 * 1000 && // 2 minutes in ms
      remainingTime > 0 &&
      !stayLoggedInPrompted
    ) {
      setStayLoggedInPrompted(true);
      Swal.fire({
        title: "Session Expiring Soon",
        text: "You have 2 minutes left. Would you like to stay logged in?",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Yes, keep me logged in",
        cancelButtonText: "No, log me out",
        customClass: {
          popup: "my-swal-popup",
          title: "my-swal-title",
          confirmButton: "my-swal-confirm",
          cancelButton: "my-swal-cancel",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          // Call backend to refresh session
          axios
            .get("https://blog-app-1-server.vercel.app/refresh-session", {
              withCredentials: true,
            })
            .then((res) => {
              setUser((prev) => ({
                ...prev,
                sessionExpiresAt: res.data.sessionExpiresAt,
              }));
              setStayLoggedInPrompted(false); // Allow future prompts
            })
            .catch(() => {
              // If refresh fails, let session expire as normal
            });
        }
        // If cancelled or dismissed, do nothing; session will expire as normal
      });
    }
    // Reset prompt if user logs out or gets a new session
    if (
      (!user || !user.sessionExpiresAt || remainingTime > 2 * 60 * 1000) &&
      stayLoggedInPrompted
    ) {
      setStayLoggedInPrompted(false);
    }
  }, [remainingTime, user, stayLoggedInPrompted]);

  return (
    <userContext.Provider
      value={{ user, setUser, sessionExpired, setSessionExpired }}
    >
      <Navbar />
      {user &&
        user.sessionExpiresAt &&
        remainingTime !== null &&
        remainingTime > 0 && (
          <div style={{ textAlign: "center", color: "red", margin: "10px" }}>
            Session expires in: {formatTime(remainingTime)}
          </div>
        )}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="/editpost/:id" element={<EditPost />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/myposts" element={<MyPosts />} />
      </Routes>
    </userContext.Provider>
  );
}

// export default App;

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
