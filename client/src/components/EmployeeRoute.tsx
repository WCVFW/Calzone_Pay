import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const EmployeeRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { auth } = useAuth();

  // If user is not authenticated or does not have the correct role, redirect to login.
  if (!auth.token || auth.user?.role !== "EMPLOYEE") {
    return <Navigate to="/login" replace />;
  }

  // If authenticated and has the correct role, render the component.
  return children;
};

export default EmployeeRoute;
