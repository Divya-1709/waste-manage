import React, { useState, Suspense } from "react";
import Home from "./Home";
import UserLogin from "./pages/UserLogin.jsx";
import AdminLogin from "./pages/AdminLogin";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import BusinessAdminDashboard from "./pages/BusinessAdminDashboard.jsx"; // Import the new dashboard
import BusinessUserDashboard from "./pages/BusinessUserDashboard.jsx"; // Import the business user dashboard
import Dashboard from "./pages/Dashboard";
import AdminAssignment from "./pages/AdminAssignment";
import ProjectOverview from "./pages/ProjectOverview";
import Account from "./pages/Account";
import TrackStatus from "./pages/TrackStatus.jsx";
import AuthSuccess from "./pages/AuthSuccess";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  const navigate = (page) => {
    setCurrentPage(page);
  };

 const renderPage = () => {
  switch (currentPage) {
    case "home":
      return <Home onNavigate={navigate} />;
    case "userLogin":
      return <UserLogin onNavigate={navigate} />;
    case "adminLogin":
      return <AdminLogin onNavigate={navigate} />;
    case "businessDashboard": // Add case for business dashboard
      return <BusinessAdminDashboard onNavigate={navigate} />;
    case "businessUserDashboard": // Add case for business user dashboard
      return <BusinessUserDashboard onNavigate={navigate} />;
    case "businessUserDashboardTest": // Add test route for business user dashboard
      return <BusinessUserDashboard onNavigate={navigate} />;
    case "userDashboard":
      return <UserDashboard onNavigate={navigate} />;
    case "adminDashboard":
      return <AdminDashboard onNavigate={navigate} />;
    case "dashboard":
      return <Dashboard onNavigate={navigate} />;
    case "adminAssignment":
      return <AdminAssignment onNavigate={navigate} />;
    case "projectOverview":
      return <ProjectOverview onNavigate={navigate} />;
    case "account":
      return <Account onNavigate={navigate} />;
    case "authSuccess":
      return <AuthSuccess onNavigate={navigate} />;
    case "trackStatus": // 👈 ADD THIS
      return <TrackStatus onNavigate={navigate} />;
    case "services":
      return <Services onNavigate={navigate} />;
    case "about":
      return <About onNavigate={navigate} />;
    case "contact":
      return <Contact onNavigate={navigate} />;
    case "signup":
      return <UserLogin onNavigate={navigate} />; // Redirect signup to login for now
    default:
      return <Home onNavigate={navigate} />;
  }
};

  return (
    <Suspense fallback="Loading...">
      <div className="App">
        {renderPage()}
      </div>
    </Suspense>
  );
}

export default App;
