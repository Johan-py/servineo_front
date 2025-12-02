"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function GestionCitasPage() {
  const proveedorId = "6927f418475360050f2016e9"; 

  const [totalPendientes, setPendientes] = useState(0);
  const [totalHoy, setHoy] = useState(0);
  const [totalCanceladas, setCanceladas] = useState(0);

  useEffect(() => {
    async function cargarCitas() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/devcode/citas/proveedor/${proveedorId}`
        );
        const json = await res.json();
        if (!json.success) return;

        const citas = json.data;

        const hoy = new Date().toISOString().slice(0, 10);

        let pendientes = 0;
        let paraHoy = 0;
        let canceladas = 0;

        citas.forEach((cita: any) => {
          // Contadores por estado
          switch (cita.estado) {
            case "pendiente":
              pendientes++;
              break;
            case "cancelada":
              canceladas++;
              break;
          }

          // Contador para hoy
          const fechaCita = cita.fecha ? cita.fecha.slice(0, 10) : null;
          if (fechaCita === hoy) paraHoy++;
        });

        setPendientes(pendientes);
        setHoy(paraHoy);
        setCanceladas(canceladas);

      } catch (err) {
        console.error("Error cargando citas:", err);
      }
    }

    cargarCitas();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      {/* Título */}
      <div className="max-w-5xl mx-auto mb-10">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-2">
          Panel de Control del Fixer
        </h1>
        <p className="text-gray-600">
          Aquí puedes administrar tus citas, horarios y cancelaciones.
        </p>
      </div>

      {/* Tarjetas */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white shadow-md rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-700">Citas pendientes</h3>
          <p className="text-4xl font-bold text-blue-700 mt-2">{totalPendientes}</p>
        </div>

        <div className="bg-white shadow-md rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-700">Citas para hoy</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">{totalHoy}</p>
        </div>

        <div className="bg-white shadow-md rounded-2xl p-6 border border-blue-100 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-700">Canceladas</h3>
          <p className="text-4xl font-bold text-red-500 mt-2">{totalCanceladas}</p>
        </div>
      </div>

      {/* Acciones */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/booking/worker/citas"
          className="p-8 bg-blue-700 text-white rounded-2xl shadow-md hover:bg-blue-800 transition flex flex-col justify-center items-center text-center"
        >
          <span className="text-2xl font-bold mb-2">📅</span>
          <h3 className="text-xl font-semibold">Ver citas programadas</h3>
          <p className="text-sm text-blue-100 mt-2">
            Revisa todas tus citas activas y detalles.
          </p>
        </Link>

        <Link
          href="/booking/worker/cancelacion"
          className="p-8 bg-red-600 text-white rounded-2xl shadow-md hover:bg-red-700 transition flex flex-col justify-center items-center text-center"
        >
          <span className="text-2xl font-bold mb-2">⚠️</span>
          <h3 className="text-xl font-semibold">Cancelar citas</h3>
          <p className="text-sm text-red-100 mt-2">
            Gestiona solicitudes de cancelación.
          </p>
        </Link>

        <Link
          href="/booking/worker/registrarHorarios"
          className="p-8 bg-green-600 text-white rounded-2xl shadow-md hover:bg-green-700 transition flex flex-col justify-center items-center text-center"
        >
          <span className="text-2xl font-bold mb-2">⏰</span>
          <h3 className="text-xl font-semibold">Configurar horarios</h3>
          <p className="text-sm text-green-100 mt-2">
            Ajusta tu disponibilidad de trabajo.
          </p>
        </Link>
      </div>
    </div>
  );
}
