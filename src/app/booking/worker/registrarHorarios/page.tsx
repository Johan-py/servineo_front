import { Link } from 'lucide-react';
import ScheduleConfigurator from './components/ScheduleConfigurator'; // Usamos '@' si estás usando el App Router

export default function HomePage() {
  return (
    // Aplica un padding vertical para que el formulario no esté pegado al borde
    <div className="py-10"> 

      <ScheduleConfigurator />
    </div>
  );
}