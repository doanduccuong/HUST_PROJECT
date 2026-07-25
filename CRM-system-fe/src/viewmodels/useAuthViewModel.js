"use client";

import { useState, useEffect } from "react";

export function useAuthViewModel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedToken = localStorage.getItem("crm_token");
      const savedUserObj = localStorage.getItem("crm_user");
      if (savedToken && savedUserObj) {
        try {
          const decoded = JSON.parse(atob(savedToken.split('.')[1]));
          if (decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem("crm_token");
            localStorage.removeItem("crm_user");
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
          } else {
            setToken(savedToken);
            setUser(JSON.parse(savedUserObj));
            setIsAuthenticated(true);
          }
        } catch {
          localStorage.removeItem("crm_token");
          localStorage.removeItem("crm_user");
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8081/api/v1/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Login failed");
      }

      const data = await response.json();
      
      localStorage.setItem("crm_token", data.token);
      localStorage.setItem("crm_user", JSON.stringify({
        username: data.username,
        fullname: data.fullname,
        role: data.role,
      }));

      setToken(data.token);
      setUser({
        username: data.username,
        fullname: data.fullname,
        role: data.role,
      });
      setIsAuthenticated(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please check if the Java Backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("crm_token");
    localStorage.removeItem("crm_user");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    token,
    user,
    loading,
    error,
    login,
    logout,
  };
}
