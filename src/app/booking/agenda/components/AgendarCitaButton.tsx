"use client";
import { useState } from "react";
import { AppointmentModal } from "./appointment-modal";
import { useCurrentClienteId } from "@/config/userConfig";

interface AgendarCitaButtonProps {
  proveedorId: string;  // <-- definir props aquí
  servicioId: string;
}

export default function AgendarCitaButton({ proveedorId, servicioId }: AgendarCitaButtonProps) {
  const [open, setOpen] = useState(false);
  const clienteId = useCurrentClienteId(); 
  
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-5 py-2 bg-[#4289CC] text-white rounded-lg hover:bg-blue-700 transition transform hover:scale-105 duration-300 font-medium"
      >
        Agendar Cita
      </button>

      <AppointmentModal
        open={open}
        onOpenChange={setOpen}
        patientName="Juan Pérez"
        providerId={proveedorId} 
        servicioId={servicioId}  
        clienteId={clienteId}
        slotMinutes={30}
        hours="08:00-12:00,14:00-18:00"
      />
    </>
  );
}
