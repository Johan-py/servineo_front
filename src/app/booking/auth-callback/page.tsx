"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../context/AuthProvider";
import { Suspense } from "react";

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { processOAuthCallback } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        const data = searchParams.get("data");
        const error = searchParams.get("error");

        if (error) {
          console.error("OAuth error:", error);
          alert(`Error: ${error}`);
          router.push("/booking");
          return;
        }

        if (data) {
          const callbackData = JSON.parse(decodeURIComponent(data));
          const { clienteId, accessToken, user } = callbackData;

          processOAuthCallback(accessToken, clienteId, user);

          // Redirigir a booking/agenda
          setTimeout(() => {
            router.push("/booking/agenda");
          }, 500);
        } else {
          router.push("/booking");
        }
      } catch (e) {
        console.error("Error processing OAuth callback:", e);
        router.push("/booking");
      }
    };

    processCallback();
  }, [searchParams]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div>
        <p>Procesando autenticación...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
