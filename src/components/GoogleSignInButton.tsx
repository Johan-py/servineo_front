"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { LogOut, Mail } from "lucide-react";

export default function GoogleSignInButton() {
  const { signOut, user, processOAuthCallback, isLoading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Chequear si hay callback de OAuth cuando se carga la página
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.has("from_oauth")) {
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  const handleSignIn = async () => {
    try {
      setRedirecting(true);
      // Solicitar la URL de login a backend (puerto 5000)
      // Incluir credenciales para que el backend pueda enviar la cookie 'oauth_state'
      const res = await fetch("http://localhost:5000/api/devcode/auth/google-login", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (data.authUrl) {
        // Redirigir a Google
        window.location.href = data.authUrl;
      }
    } catch (e) {
      console.error("Error initiating Google login:", e);
      alert("Error iniciando sesión con Google");
      setRedirecting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (e) {
      console.error("Error signing out:", e);
    }
  };

  return (
    <div>
      {user ? (
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: "8px 12px",
            borderRadius: "8px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #e0e0e0",
          }}
        >
          {user.picture && (
            <img
              src={user.picture}
              alt="avatar"
              width={36}
              height={36}
              style={{
                borderRadius: "50%",
                border: "2px solid #4285f4",
                objectFit: "cover",
              }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#202124", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.name ?? user.email}
            </span>
            <span style={{ fontSize: 11, color: "#5f6368", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </span>
          </div>
          <button
            onClick={handleSignOut}
            disabled={isLoading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              marginLeft: "auto",
              backgroundColor: "#ea4335",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: isLoading ? "not-allowed" : "pointer",
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.2s ease",
              opacity: isLoading ? 0.7 : 1,
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#c5221f";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#ea4335";
            }}
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      ) : (
        <button
          onClick={handleSignIn}
          disabled={redirecting || isLoading}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "12px 24px",
            backgroundColor: "white",
            color: "#202124",
            border: "1px solid #dadce0",
            borderRadius: "8px",
            cursor: redirecting || isLoading ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: 600,
            transition: "all 0.3s ease",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            opacity: redirecting || isLoading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!redirecting && !isLoading) {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#f8f9fa";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "white";
          }}
        >
          {/* Google Logo SVG */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          {redirecting ? "Redirigiendo..." : "Iniciar sesión con Google"}
        </button>
      )}
    </div>
  );
}
