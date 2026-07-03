import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Clock, ChevronLeft, ChevronRight, ArrowLeft, 
  CheckCircle, Activity, CalendarDays, FilePlus,
  Plus, User
} from "lucide-react";
import "../styles/DoctorAppointments.css";
import { updateAppointmentStatus, getAppointmentsByDoctor, saveAppointment } from "../services/appointmentService";
import { getSchedulesByDoctor } from "../services/scheduleService";
import ClinicalDiaryModal from "../components/modals/ClinicalDiaryModal";

interface Appointment {
  id: number;
  appointmentDate: string;
  status: string;
  patient: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
}

const DoctorAppointments: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const mode = queryParams.get("mode") || "view"; // "view" o "register"

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMonth, setViewMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState<boolean>(true);
  
  const [modalState, setModalState] = useState<{ open: boolean; type: string | null; appointment: any }>({
    open: false,
    type: null,
    appointment: null
  });

  const [showRegForm, setShowRegForm] = useState(false);
  const [newAppt, setNewAppt] = useState({ patientId: "", time: "09:00" });

  const doctorId = localStorage.getItem("doctorId");

  useEffect(() => {
    if (doctorId) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [doctorId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [appts, schs] = await Promise.all([
        getAppointmentsByDoctor(Number(doctorId)),
        getSchedulesByDoctor(Number(doctorId))
      ]);
      setAppointments(appts);
      setSchedules(schs);
      
      // Filtrar pacientes: Solo aquellos que ya tienen o tuvieron cita con este doctor
      const uniquePatients: any[] = [];
      const patientIds = new Set();
      
      appts.forEach((a: any) => {
        if (!patientIds.has(a.patient.id)) {
          patientIds.add(a.patient.id);
          uniquePatients.push(a.patient);
        }
      });
      
      setPatients(uniquePatients);
    } catch (err) {
      console.error("Error cargando datos:", err);
    } finally {
      setLoading(false);
    }
  };

  // Lógica del Calendario de Red (Grid)
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 (Dom) a 6 (Sab)
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Espacios en blanco al inicio (ajustar a Lunes como primer día)
    const startGap = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < startGap; i++) days.push(null);
    
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const calendarDays = getDaysInMonth(viewMonth);

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const hasAppointments = (date: Date) => {
    return appointments.some(a => isSameDay(new Date(a.appointmentDate), date));
  };

  const filteredAppointments = appointments.filter(a => {
    const apptDate = new Date(a.appointmentDate);
    return isSameDay(apptDate, selectedDate);
  });

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateAppointmentStatus(id, newStatus);
      loadData();
    } catch (error) {
      console.error("Error al cambiar estado:", error);
    }
  };

  const handleSaveAppt = async () => {
    if (!newAppt.patientId || !newAppt.time) return alert("Completa todos los campos");
    
    // Validar contra horario del doctor
    const dayName = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"][selectedDate.getDay()];
    const daySchedule = schedules.filter(s => s.dayOfWeek === dayName);
    
    if (daySchedule.length === 0) return alert("No tienes horario registrado para este día");
    
    const [h, m] = newAppt.time.split(":").map(Number);
    const apptTime = h * 60 + m;
    
    const isValid = daySchedule.some(s => {
      const [sh, sm] = s.startTime.split(":").map(Number);
      const [eh, em] = s.endTime.split(":").map(Number);
      return apptTime >= (sh * 60 + sm) && apptTime <= (eh * 60 + em);
    });
    
    if (!isValid) return alert("La hora seleccionada está fuera de tu rango de atención");

    try {
      const dateStr = `${selectedDate.toISOString().split("T")[0]}T${newAppt.time}:00`;
      await saveAppointment({
        doctor: { id: Number(doctorId) },
        patient: { id: Number(newAppt.patientId) },
        appointmentDate: dateStr,
        status: "SCHEDULED"
      });
      alert("Cita agendada con éxito");
      setShowRegForm(false);
      loadData();
    } catch (e) {
      console.error(e);
      alert("Error al agendar cita");
    }
  };

  const changeMonth = (offset: number) => {
    const newMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + offset, 1);
    setViewMonth(newMonth);
  };

  if (loading) return <div className="loading-state">Cargando...</div>;

  return (
    <div className="doctor-calendar-wrapper">
      <header className="page-header-top">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={20} /> <span>Volver</span>
        </button>
        <div className="header-title-section">
          <CalendarDays size={28} />
          <h1>{mode === "register" ? "Registrar Cita Médica" : "Mi Agenda Médica"}</h1>
        </div>
      </header>

      <div className="calendar-grid-container">
        <div className="calendar-sidebar">
          <div className="month-nav">
            <button onClick={() => changeMonth(-1)}><ChevronLeft /></button>
            <h3>{viewMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' }).toUpperCase()}</h3>
            <button onClick={() => changeMonth(1)}><ChevronRight /></button>
          </div>
          
          <div className="days-header" translate="no">
            <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
          </div>
          
          <div className="calendar-grid">
            {calendarDays.map((date, idx) => (
              <div 
                key={idx} 
                className={`calendar-cell ${!date ? 'empty' : ''} ${date && isSameDay(date, selectedDate) ? 'selected' : ''} ${date && hasAppointments(date) ? 'has-appt' : ''}`}
                onClick={() => date && setSelectedDate(date)}
              >
                {date && date.getDate()}
              </div>
            ))}
          </div>
        </div>

        <div className="appointments-detail">
          <div className="detail-header">
            <h2>{selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
            {mode === "register" && selectedDate >= new Date(new Date().setHours(0,0,0,0)) && (
              <button className="btn-add-appt" onClick={() => setShowRegForm(!showRegForm)}>
                <Plus size={20} /> Nueva Cita
              </button>
            )}
          </div>

          {showRegForm && (
            <div className="quick-reg-form animate-fade-in">
              <div className="input-group">
                <label><User size={16} /> Paciente</label>
                <select value={newAppt.patientId} onChange={e => setNewAppt({...newAppt, patientId: e.target.value})}>
                  <option value="">Seleccionar paciente...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label><Clock size={16} /> Hora</label>
                <input type="time" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setShowRegForm(false)}>Cancelar</button>
                <button className="btn-save" onClick={handleSaveAppt}>Confirmar Cita</button>
              </div>
            </div>
          )}

          <div className="appt-list-modern">
            {filteredAppointments.length === 0 ? (
              <div className="empty-state-mini">No hay citas para este día.</div>
            ) : (
              filteredAppointments.map(a => (
                <div key={a.id} className={`appt-item-mini ${a.status.toLowerCase()}`}>
                  <div className="appt-time-info">
                    <span className="time">{new Date(a.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    <span className={`dot ${a.status.toLowerCase()}`}></span>
                  </div>
                  <div className="patient-mini-info">
                    <strong>{a.patient.name}</strong>
                    <span>{a.status}</span>
                  </div>
                  <div className="appt-actions-mini">
                    {mode === "view" && (
                      <>
                        {(a.status === "SCHEDULED" || a.status === "PENDING") && (
                          <button onClick={() => handleStatusChange(a.id, "IN_CONSULTATION")} title="Atender">
                            <Activity size={18} />
                          </button>
                        )}
                        {a.status === "IN_CONSULTATION" && (
                          <>
                            <button className="btn-finish" onClick={() => handleStatusChange(a.id, "COMPLETED")} title="Finalizar">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => setModalState({ open: true, type: "diario", appointment: a })} title="Documentar">
                              <FilePlus size={18} />
                            </button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {modalState.open && (
        modalState.type === "diario" ? (
          <ClinicalDiaryModal isOpen={true} onClose={() => {setModalState({ ...modalState, open: false }); loadData();}} appointmentId={modalState.appointment.id} patientId={modalState.appointment.patient.id} doctorId={Number(doctorId)} />
        ) : null
      )}
    </div>
  );
};

export default DoctorAppointments;
