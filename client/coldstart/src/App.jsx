import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Landing from "./pages/Landing";
import Network from "./pages/Network";
import Project from "./pages/Project";
import SearchResults from "./pages/SearchResults";
import Chat from "./pages/Chat";
import Jobs from "./pages/Jobs";
import Applicants from "./pages/Applicants";

function App() {
  useEffect(() => {
    fetch("http://localhost:8080/")
      .then((res) => res.text())
      .catch((err) => console.log("Server not found"));
  }, []); 

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/network" element={<Network />} />
        <Route path="/project" element={<Project />} />
        <Route path="/search" element={<SearchResults />}/>
        <Route path="/jobs" element={<Jobs />}/>
        <Route path="/chat" element={<Chat />}/>
        <Route path="/applicants" element={<Applicants />}/>
      </Routes>
    </Router>
  );
}

export default App;