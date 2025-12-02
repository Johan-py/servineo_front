"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react"; // Import React for React.ReactNode

interface GoogleConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  baseMessage: string; // Message for the appointment itself
  body: any; // Entire response body to extract googleSync
  success: boolean; // Overall success of the operation
}

export default function GoogleConfirmationModal({
  isOpen,
  onClose,
  title,
  baseMessage,
  body,
  success,
}: GoogleConfirmationModalProps) {
  const router = useRouter();

  const handleConfirm = () => {
    onClose();
    router.push("/agenda");
  };

  // Determine googleSync status and message
  const googleSync = body?.googleSync || body?.data?.googleSync;
  let googleSyncMessage: React.ReactNode = null;

  if (googleSync?.attempted) {
    if (googleSync.success) {
      googleSyncMessage = (
        <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg text-green-800 text-sm">
          Se actualizó correctamente en Google Calendar.
        </div>
      );
    } else {
      const errMsg = googleSync.error || (googleSync.details && JSON.stringify(googleSync.details)) || 'Error desconocido';
      googleSyncMessage = (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
          <p className="font-bold">Error sincronizando con Google Calendar:</p>
          <p className="mt-1">{errMsg}</p>
        </div>
      );
    }
  }

  const finalMessage: React.ReactNode = (
    <>
      <p>{baseMessage}</p>
      {googleSyncMessage}
    </>
  );


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md text-center p-8 rounded-xl shadow-lg">
        <DialogTitle className="sr-only">{title || (success ? "Confirmación" : "Atención")}</DialogTitle>

        <div className="flex justify-center mb-4">
          <div className={`rounded-full p-4 ${success ? "bg-green-100" : "bg-red-100"}`}>
            {success ? (
              <CheckCircle className="text-green-600 w-10 h-10" />
            ) : (
              <AlertTriangle className="text-red-600 w-10 h-10" />
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <div className="text-gray-600 mb-6 text-left">
          {finalMessage}
        </div>

        <Button
          className={`${success ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"} w-full`}
          onClick={handleConfirm}
        >
          Volver al inicio
        </Button>
      </DialogContent>
    </Dialog>
  );
}
