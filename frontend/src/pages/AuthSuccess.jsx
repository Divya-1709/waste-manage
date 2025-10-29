import React, { useEffect } from "react";

const AuthSuccess = ({ onNavigate }) => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      alert("Google login successful!");
      onNavigate("userDashboard");
    } else {
      alert("Login failed. Please try again.");
      onNavigate("userLogin");
    }
  }, [onNavigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Signing you in...</h2>
    </div>
  );
};

export default AuthSuccess;
