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
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export const userContext = createContext(); // create a global state

function App() {
  const [user, setUser] = useState({});
  const [sessionExpired, setSessionExpired] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [wasPreviouslyLoggedIn, setWasPreviouslyLoggedIn] = useState(false);
  const navigate = useNavigate(); // for redirection

  axios.defaults.withCredentials = true;

  // useEffect(() => {
  //   axios
  //     .get("https://blog-app-1-server.vercel.app/")
  //     .then((res) => {
  //       if (res.data.username !== undefined) {
  //         setUser(res.data); // Only set the user if username exists
  //         setSessionExpired(false); // session is valid
  //       } else {
  //         setUser({}); // Reset user if token is invalid
  //         setSessionExpired(true); // session has expired or no valid token
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err);
  //       setUser({});
  //       setSessionExpired(true); // assume expired on error
  //     });
  // }, []);

  // useEffect(() => {
  //   axios
  //     .get("https://blog-app-1-server.vercel.app/")
  //     .then((res) => {
  //       if (res.data.username) {
  //         setUser(res.data);
  //         setWasPreviouslyLoggedIn(true); // user had been logged in before
  //         setSessionExpired(false);
  //       } else {
  //         setUser({});
  //         setSessionExpired(true);
  //       }
  //       setInitialCheckDone(true);
  //     })
  //     .catch((err) => {
  //       if (
  //         err.response ||
  //         err.response.status === 401 ||
  //         err.response.data === "Token is not valid"
  //       ) {
  //         setSessionExpired(true);
  //       }
  //       setUser({});
  //       setInitialCheckDone(true);
  //     });
  // }, []);

  // auto check session every 5 minutes
  useEffect(() => {
    const checkSession = () => {
      axios
        .get("https://blog-app-1-server.vercel.app/")
        .then((res) => {
          if (res.data.username) {
            setUser(res.data);
            setSessionExpired(false);
          } else {
            setUser({});
            setSessionExpired(true);
          }
        })
        .catch((err) => {
          if (
            err.response?.status === 401 ||
            err.response?.data === "Token is not valid"
          ) {
            setSessionExpired(true);
          }
          setUser({});
        });
    };

    // Run immediately on mount
    checkSession();

    // Then check every 10 minutes
    const interval = setInterval(checkSession, 10 * 60 * 1000); // 10 min

    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, []);

  // Alert & Redirect if session expires for logged-in users
  // useEffect(() => {
  //   if (sessionExpired && Object.keys(user).length > 0) {
  //     alert("Your session has expired. Please log in again.");
  //     setUser({});
  //     navigate("/login");
  //   }
  // }, [sessionExpired]);

  // useEffect(() => {
  //   if (sessionExpired && user._id === undefined) {
  //     alert("Your session has expired. Please log in again.");
  //     setUser({});
  //     navigate("/login");
  //   }
  // }, [sessionExpired]);

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

  useEffect(() => {
    // const remaining = user.expiresAt - Date.now();
    // if (user._id !== undefined) {
    //   console.log(remaining);
    // }

    if (sessionExpired && user._id === undefined) {
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
        if (result.isConfirmed) {
          navigate("/login");
        } else if (result.isDenied) {
          navigate("/register");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          navigate("/");
        }
      });

      setUser({});
    }
  }, [sessionExpired]);

  // useEffect(() => {
  //   if (initialCheckDone && sessionExpired && wasPreviouslyLoggedIn) {
  //     alert("Your session has expired. Please log in again.");
  //     navigate("/login");
  //   }
  // }, [sessionExpired, initialCheckDone, wasPreviouslyLoggedIn]);

  // return (
  //   <userContext.Provider value={{ user, setUser }}>
  //     <BrowserRouter>
  //       <Navbar />
  //       <Routes>
  //         <Route path="/" element={<Home />} />
  //         <Route path="/register" element={<Register />} />
  //         <Route path="/login" element={<Login />} />
  //         <Route path="/create" element={<CreatePost />} />
  //         <Route path="/post/:id" element={<Post />} />
  //         <Route path="/editpost/:id" element={<EditPost />} />
  //         <Route path="/contact" element={<Contact />} />
  //       </Routes>
  //     </BrowserRouter>
  //   </userContext.Provider>
  // );

  return (
    <userContext.Provider value={{ user, setUser }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/post/:id" element={<Post />} />
        <Route path="/editpost/:id" element={<EditPost />} />
        <Route path="/contact" element={<Contact />} />
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
