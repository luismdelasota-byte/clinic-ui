import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { getSchedulesByDoctor } from "../../services/scheduleService";
import "../../styles/DoctorScheduleView.css";

const DoctorScheduleView: React.FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const doctorId = localStorage.getItem("doctorId");

  useEffect(() => {
    if (doctorId) {
      loadData();
    }
  }, [doctorId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getSchedulesByDoctor(Number(doctorId));
      setSchedules(data);
    } catch (error) {
      console.error("Error loading schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysCount = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    
    // Ajustar para que lunes sea el primer día (0=Lunes, 6=Domingo)
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    // Espacios vacíos para el inicio del mes
    for (let i = 0; i < startOffset; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    const daysOfWeekEs = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];

    for (let day = 1; day <= daysCount; day++) {
      const date = new Date(year, month, day);
      const dayOfWeekName = daysOfWeekEs[date.getDay() === 0 ? 6 : date.getDay() - 1];
      
      const daySchedules = schedules.filter(s => s.dayOfWeek.toUpperCase() === dayOfWeekName);
      const isScheduled = daySchedules.length > 0;

      days.push(
        <div key={day} className={`calendar-day ${isScheduled ? 'scheduled' : ''}`}>
          <span className="day-number">{day}</span>
          {isScheduled && (
            <div className="schedule-info">
              {daySchedules.map((s, idx) => (
                <div key={idx} className="time-range">
                  <Clock size={10} /> {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  if (loading) return <div className="doctor-schedule-wrapper"><div className="loading-state">Cargando horario...</div></div>;

  return (
    <div className="doctor-schedule-wrapper">
      <header className="page-header-top">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={20} />
          <span>Volver al Dashboard</span>
        </button>
        <div className="header-main">
          <div className="title-group">
            <CalendarIcon className="header-icon" size={32} />
            <h1>Mi Horario Mensual</h1>
          </div>
          <div className="calendar-controls">
            <button onClick={handlePrevMonth}><ChevronLeft /></button>
            <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button onClick={handleNextMonth}><ChevronRight /></button>
          </div>
        </div>
      </header>

      <div className="calendar-container animate-fade-in">
        <div className="calendar-grid" translate="no">
          {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map(d => (
            <div key={d} className="calendar-weekday">{d}</div>
          ))}
          {renderCalendar()}
        </div>
        
        <div className="calendar-legend">
          <div className="legend-item">
            <div className="dot green"></div>
            <span>Días de atención asignados</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorScheduleView;
