import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, User, ArrowLeft, CheckCircle, AlertCircle, CalendarDays } from "lucide-react";
import { getAppointmentsByPatient } from "../../services/appointmentService";
import "../../styles/patients.css"; // Reutilizamos estilos de pacientes o creamos uno nuevo

interface Appointment {
  id: number;
  doctorName: string;
  date: string;
  time: string;
  status: string;
}

const PatientAppointments: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener el ID del paciente: de la URL o del localStorage si es el paciente logueado
  const patientId = id ? Number(id) : Number(localStorage.getItem("patientId"));

  useEffect(() => {
    if (patientId) {
      loadAppointments(patientId);
    } else {
      setLoading(false);
    }
  }, [patientId]);

  const loadAppointments = async (pid: number) => {
    try {
      const data = await getAppointmentsByPatient(pid);
      setAppointments(data);
    } catch (error) {
      console.error("Error al cargar citas:", error);
    } finally {
      setLoading(false);
    }
  };

  const isPast = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const apptDate = new Date(dateStr);
    return apptDate < today;
  };

  const upcomingAppointments = appointments.filter(a => !isPast(a.date));
  const pastAppointments = appointments.filter(a => isPast(a.date));

  return (
    <div className="manage-patients-container">
      <header className="page-header">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={20} />
          <span>Volver al Dashboard</span>
        </button>
        <div className="header-title">
          <CalendarDays className="header-icon" size={32} />
          <h1>Mis Citas Médicas</h1>
        </div>
      </header>

      <div className="appointments-content animate-fade-in">
        {loading ? (
          <div className="loading-state">Cargando tus citas...</div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <p>No tienes citas registradas aún.</p>
          </div>
        ) : (
          <div className="appointments-grid">
            
            {/* Sección: Próximas Citas */}
            <section className="appointment-section">
              <h2 className="section-title">
                <AlertCircle size={20} className="text-blue" />
                Próximas Citas
              </h2>
              <div className="appointment-cards">
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map(a => (
                    <div key={a.id} className="appointment-card upcoming">
                      <div className="card-status status-pending">Pendiente</div>
                      <div className="card-body">
                        <div className="doctor-info">
                          <User size={18} />
                          <span>{a.doctorName}</span>
                        </div>
                        <div className="date-info">
                          <Calendar size={18} />
                          <span>{a.date}</span>
                        </div>
                        <div className="time-info">
                          <Clock size={18} />
                          <span>{a.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No tienes citas pendientes.</p>
                )}
              </div>
            </section>

            {/* Sección: Historial */}
            <section className="appointment-section">
              <h2 className="section-title">
                <CheckCircle size={20} className="text-green" />
                Historial (Atendidas)
              </h2>
              <div className="appointment-cards">
                {pastAppointments.length > 0 ? (
                  pastAppointments.map(a => (
                    <div key={a.id} className="appointment-card past">
                      <div className="card-status status-completed">Atendido</div>
                      <div className="card-body">
                        <div className="doctor-info">
                          <User size={18} />
                          <span>{a.doctorName}</span>
                        </div>
                        <div className="date-info">
                          <Calendar size={18} />
                          <span>{a.date}</span>
                        </div>
                        <div className="time-info">
                          <Clock size={18} />
                          <span>{a.time}</span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">No hay historial de citas.</p>
                )}
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;
