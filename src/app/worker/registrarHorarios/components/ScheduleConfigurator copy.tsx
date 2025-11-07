'use client';

import React, { useState, useCallback } from 'react';
import {
  ScheduleConfig,
  TimeRange,
  DayName,
  DAYS_OF_WEEK,
  ScheduleErrors,
  WeeklyUniformSchedule,
  DaySchedule
} from '../types'; 

const PROVEEDOR_ID = "690c29d00c736bec44e473e4";
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// --- Utilidades ---
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const validateTimeRange = (start: string, end: string): boolean => {
  return timeToMinutes(end) > timeToMinutes(start);
};

const validateNoOverlap = (ranges: TimeRange[]): boolean => {
  if (ranges.length <= 1) return true;
  const minuteRanges = ranges
    .map(r => ({ start: timeToMinutes(r.start), end: timeToMinutes(r.end) }))
    .sort((a, b) => a.start - b.start);

  for (let i = 0; i < minuteRanges.length - 1; i++) {
    if (minuteRanges[i].end > minuteRanges[i + 1].start) return false;
  }
  return true;
};

// --- Estado Inicial ---
const initialDayConfig: DaySchedule = { enabled: false, ranges: [{ start: '09:00', end: '18:00' }] };
const initialSchedule: ScheduleConfig = DAYS_OF_WEEK.reduce((acc, day) => {
  acc[day] = initialDayConfig;
  return acc;
}, {} as Record<DayName, DaySchedule>) as ScheduleConfig;

const initialWeeklySchedule: WeeklyUniformSchedule = {
  selectedDays: ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'],
  ranges: [{ start: '09:00', end: '18:00' }],
};

// --- Componente ---
export default function ScheduleConfigurator() {
  const [schedule, setSchedule] = useState<ScheduleConfig>(initialSchedule);
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklyUniformSchedule>(initialWeeklySchedule);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');
  const [errors, setErrors] = useState<ScheduleErrors>({});
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const diasMap: Record<string, number> = {
    Lunes: 1,
    Martes: 2,
    Miercoles: 3,
    Jueves: 4,
    Viernes: 5,
    Sabado: 6,
    Domingo: 7,
  };

  // --- Configuración Diaria ---
  const toggleDay = (day: DayName) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
    setHasChanges(true);
  };

  const addRange = (day: DayName) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], ranges: [...prev[day].ranges, { start: '09:00', end: '18:00' }] },
    }));
    setHasChanges(true);
  };

  const removeRange = (day: DayName, index: number) => {
    setSchedule(prev => ({
      ...prev,
      [day]: { ...prev[day], ranges: prev[day].ranges.filter((_, i) => i !== index) },
    }));
    setHasChanges(true);
  };

  const handleTimeChange = (day: DayName, index: number, field: keyof TimeRange, value: string) => {
    setSchedule(prev => {
      const newRanges = prev[day].ranges.map((r, i) => i === index ? { ...r, [field]: value } : r);
      return { ...prev, [day]: { ...prev[day], ranges: newRanges } };
    });
    setHasChanges(true);
  };

  // --- Configuración Semanal ---
  const toggleWeeklyDay = (day: DayName) => {
    setWeeklySchedule(prev => {
      const isSelected = prev.selectedDays.includes(day);
      return {
        ...prev,
        selectedDays: isSelected
          ? prev.selectedDays.filter(d => d !== day)
          : [...prev.selectedDays, day].sort((a, b) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b)),
      };
    });
    setHasChanges(true);
  };

  const handleWeeklyTimeChange = (index: number, field: keyof TimeRange, value: string) => {
    setWeeklySchedule(prev => ({
      ...prev,
      ranges: prev.ranges.map((r, i) => i === index ? { ...r, [field]: value } : r)
    }));
    setHasChanges(true);
  };

  const addWeeklyRange = () => {
    setWeeklySchedule(prev => ({
      ...prev,
      ranges: [...prev.ranges, { start: '09:00', end: '18:00' }]
    }));
    setHasChanges(true);
  };

  const removeWeeklyRange = (index: number) => {
    setWeeklySchedule(prev => ({
      ...prev,
      ranges: prev.ranges.filter((_, i) => i !== index)
    }));
    setHasChanges(true);
  };

  // --- Validación ---
  const validateAndSetErrors = useCallback((): boolean => {
    let isValid = true;
    const newErrors: ScheduleErrors = {};

    if (activeTab === 'daily') {
      DAYS_OF_WEEK.forEach(day => {
        if (schedule[day].enabled) {
          const ranges = schedule[day].ranges;
          if (!validateNoOverlap(ranges)) {
            isValid = false;
            newErrors[day] = "Error: Rangos de horario se superponen.";
          }
          ranges.forEach((r, i) => {
            if (!validateTimeRange(r.start, r.end)) {
              isValid = false;
              newErrors[`${day}-${i}`] = "La hora de fin debe ser posterior a la de inicio.";
            }
          });
        }
      });
    } else {
      const { ranges, selectedDays } = weeklySchedule;
      if (selectedDays.length === 0) {
        isValid = false;
        newErrors['weekly-days'] = "Debes seleccionar al menos un día para aplicar el horario.";
      }
      ranges.forEach((r, i) => {
        if (!validateTimeRange(r.start, r.end)) {
          isValid = false;
          newErrors[`weekly-range-${i}`] = "La hora de fin debe ser posterior a la de inicio.";
        }
      });
      if (!validateNoOverlap(ranges)) {
        isValid = false;
        newErrors['weekly-overlap'] = "Rangos semanales se superponen.";
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [schedule, weeklySchedule, activeTab]);

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAndSetErrors()) return;

    let payload: { dia: number; activo: boolean; rangos: { inicio: string; fin: string }[] }[] = [];

    if (activeTab === 'daily') {
      payload = Object.entries(schedule)
        .filter(([_, dayData]) => dayData.enabled && dayData.ranges.length > 0)
        .map(([nombreDia, dayData]) => ({
          dia: diasMap[nombreDia],
          activo: dayData.enabled,
          rangos: dayData.ranges.map(r => ({ inicio: r.start, fin: r.end })),
        }));
    } else {
      payload = weeklySchedule.selectedDays.map(dia => ({
        dia: diasMap[dia],
        activo: true,
        rangos: weeklySchedule.ranges.map(r => ({ inicio: r.start, fin: r.end })),
      }));
    }

    try {
      const res = await fetch(`${API_URL}/api/devcode/proveedores/${PROVEEDOR_ID}/horarioLaboral`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo: activeTab === 'weekly' ? 'semanal' : 'diario',
          dias: payload,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      setIsSuccessVisible(true);
      setHasChanges(false);
      setTimeout(() => setIsSuccessVisible(false), 3000);
    } catch (error: any) {
      console.error("Error al guardar horarios:", error.message);
      alert(`Error al guardar: ${error.message}`);
    }
  };

  const handleCancel = () => {
    if (hasChanges) setIsModalOpen(true);
    else console.log("No hay cambios para cancelar.");
  };

  // --- Sección Semanal ---
  const WeeklyConfigSection = () => (
    <section className="space-y-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-3 mb-4">Horario Uniforme</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona los días</label>
        <div className="flex flex-wrap gap-2">
          {DAYS_OF_WEEK.map(day => {
            const isSelected = weeklySchedule.selectedDays.includes(day);
            return (
              <button key={day} type="button" onClick={() => toggleWeeklyDay(day)}
                className={`py-2 px-4 text-sm font-medium rounded-full ${isSelected ? 'bg-blue-900 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                {day}
              </button>
            );
          })}
        </div>
        {errors['weekly-days'] && <p className="mt-2 text-sm text-red-600">{errors['weekly-days']}</p>}
      </div>

      <hr className="my-4" />

      {weeklySchedule.ranges.map((r, i) => (
        <div key={i} className="flex items-center space-x-3 mb-2">
          <input type="time" value={r.start} onChange={e => handleWeeklyTimeChange(i, 'start', e.target.value)} className="form-input w-32 text-center" />
          <span>-</span>
          <input type="time" value={r.end} onChange={e => handleWeeklyTimeChange(i, 'end', e.target.value)} className="form-input w-32 text-center" />
          {weeklySchedule.ranges.length > 1 && <button type="button" onClick={() => removeWeeklyRange(i)} className="text-red-500">Eliminar</button>}
          {errors[`weekly-range-${i}`] && <p className="text-sm text-red-600 ml-2">{errors[`weekly-range-${i}`]}</p>}
        </div>
      ))}
      <button type="button" onClick={addWeeklyRange} className="text-sm text-blue-700 hover:text-blue-900 mt-2">+ Añadir Rango</button>

      <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-900 text-blue-800 rounded">
        <p className="font-semibold">Horario Aplicado:</p>
        <p>{weeklySchedule.selectedDays.join(', ') || 'Ningún día seleccionado'}</p>
        {weeklySchedule.ranges.map((r, i) => <p key={i} className="text-lg font-bold">{r.start} - {r.end}</p>)}
      </div>
    </section>
  );

  return (
    <main className="min-h-full p-6 bg-white font-sans">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-900">Configuración de Horarios Laborales</h1>
        </header>

        <div className="flex border-b border-gray-200 mb-6">
          <button onClick={() => setActiveTab('daily')} className={activeTab === 'daily' ? 'border-b-2 border-indigo-600 text-indigo-600 py-2 px-4' : 'text-gray-500 py-2 px-4'}>Diaria</button>
          <button onClick={() => setActiveTab('weekly')} className={activeTab === 'weekly' ? 'border-b-2 border-indigo-600 text-indigo-600 py-2 px-4' : 'text-gray-500 py-2 px-4'}>Semanal</button>
        </div>

        <form onSubmit={handleSubmit}>
          {activeTab === 'daily' &&
            <section className="space-y-6">
              {DAYS_OF_WEEK.map(day => {
                const daySchedule = schedule[day];
                return (
                  <div key={day} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3 pb-2 border-b border-gray-100">
                      <input type="checkbox" checked={daySchedule.enabled} onChange={() => toggleDay(day)} />
                      <span className="font-semibold">{day}</span>
                    </div>
                    {daySchedule.enabled && daySchedule.ranges.map((r, i) => (
                      <div key={i} className="flex items-center space-x-2 mt-2">
                        <input type="time" value={r.start} onChange={e => handleTimeChange(day, i, 'start', e.target.value)} className="form-input w-28 text-center" />
                        <span>-</span>
                        <input type="time" value={r.end} onChange={e => handleTimeChange(day, i, 'end', e.target.value)} className="form-input w-28 text-center" />
                        {daySchedule.ranges.length > 1 && <button type="button" onClick={() => removeRange(day, i)} className="text-red-500">Eliminar</button>}
                      </div>
                    ))}
                    {daySchedule.enabled && <button type="button" onClick={() => addRange(day)} className="text-sm text-blue-700 mt-2">+ Añadir Rango</button>}
                  </div>
                );
              })}
            </section>
          }

          {activeTab === 'weekly' && <WeeklyConfigSection />}

          <hr className="my-8" />

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={handleCancel} className="px-6 py-3 bg-gray-200 rounded-md">Cancelar</button>
            <button type="submit" disabled={!hasChanges} className={`px-6 py-3 text-white rounded-md ${hasChanges ? 'bg-blue-900' : 'bg-gray-400'}`}>Guardar Horarios</button>
          </div>
        </form>

        {isSuccessVisible && <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-xl">Configuración guardada exitosamente.</div>}

        {isModalOpen && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-96">
              <h3 className="text-lg font-bold mb-4">Confirmar Cancelación</h3>
              <p className="text-gray-700 mb-6">Tienes cambios sin guardar. ¿Seguro que quieres cancelar?</p>
              <div className="flex justify-end space-x-3">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">No, Seguir Editando</button>
                <button onClick={() => { setSchedule(initialSchedule); setWeeklySchedule(initialWeeklySchedule); setErrors({}); setHasChanges(false); setIsModalOpen(false); }} className="px-4 py-2 bg-red-600 text-white rounded-md">Sí, Descartar Cambios</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
