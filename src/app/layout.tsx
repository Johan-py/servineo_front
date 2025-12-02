"use client"; // 👈 1. Convertir a Client Component

import { useState, useEffect } from "react"; // 👈 2. Importar hooks
import "leaflet/dist/leaflet.css";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import { NotificationProvider } from '@/context/NotificationContext';
import { AuthProvider } from "@/context/AuthProvider";

import Header from "./components/Header/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,

}: Readonly<{
  children: React.ReactNode;
}>) {
  // 3. Estado para rastrear la conexión
  const [isOnline, setIsOnline] = useState(true);

  // 4. Efecto para escuchar eventos de conexión
  useEffect(() => {
    // Función para actualizar el estado
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Asignar estado inicial al cargar
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine);
    }

    // Agregar event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Limpiar listeners al desmontar el componente
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []); // El array vacío asegura que esto solo se ejecute al montar/desmontar

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          {/* 5. Banner de "Sin Conexión" */}
          {!isOnline && (
            <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center p-2 z-50 shadow-lg animate-pulse">
              <p className="font-semibold">
                Estás sin conexión
              </p>
              <p className="text-sm">
                Comprueba tu conexión a internet.
              </p>
            </div>
          )}

          <Header />

          {/* SOLUCIÓN: Cambiar el padding para que funcione en todos los dispositivos */}
          <div className="pt-16 sm:pt-20">
            {/* Aumenté el padding-top */}
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}