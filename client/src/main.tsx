import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Import your AuthProvider
import App from './App';                     // Import your App.tsx
import "./index.css";                   // Your global styles

// This is the correct structure:
// 1. AuthProvider
// 2. Router
// 3. Navbar (now has access to useAuth)
// 4. App (and all its routes have access to useAuth)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <Router> 
        <App />
      </Router>
    </AuthProvider>
  </React.StrictMode>
);