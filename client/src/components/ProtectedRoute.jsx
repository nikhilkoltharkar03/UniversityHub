// import React, { useContext } from 'react';
// import { Navigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';

// function ProtectedRoute({ children }) {
//   const { currentUser, loading } = useContext(AuthContext);

//   // Show loading spinner while checking auth
//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="spinner"></div>
//         <p>Verifying authentication...</p>
//       </div>
//     );
//   }

//   // Redirect to login if not authenticated
//   if (!currentUser) {
//     return <Navigate to="/login" replace />;
//   }

//   // Render protected content if authenticated
//   return children;
// }

// export default ProtectedRoute;







import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useContext(AuthContext);

  // Show spinner while checking authentication
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  // Redirect if not logged in
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return children;
}

export default ProtectedRoute;
