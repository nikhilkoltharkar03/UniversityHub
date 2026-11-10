// import React, { createContext, useState, useEffect } from "react";
// import { onAuthStateChanged } from "firebase/auth";
// import { auth } from "../firebaseConfig";

// // Create context
// export const AuthContext = createContext();

// // AuthProvider component
// export const AuthProvider = ({ children }) => {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true); // Add loading state

//   useEffect(() => {
//     // Listen for auth changes
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setCurrentUser(user);
//       setLoading(false); // Auth check complete
//     });

//     // Cleanup subscription on unmount
//     return () => unsubscribe();
//   }, []);

//   return (
//     <AuthContext.Provider value={{ currentUser, loading }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };





import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false); // Auth check complete
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

