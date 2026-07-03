import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Clock, ArrowLeft, CheckCircle, AlertCircle, CalendarDays } from "lucide-react";
import { getAppointmentsByPatient } from "../../services/appointmentService";
import "../../styles/patients.css"; // Reutilizamos estilos de pacientes o creamos uno nuevo

interface Appointment {
  id: number;
  appointmentDate: string;
  status: string;
  doctor: {
    id: number;
    name: string;
    speciality: string;
  };
}

const PatientAppointments: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    const time = date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    return { day, time };
  };

  const pendingAppointments = appointments.filter(a => a.status === "PENDING" || a.status === "SCHEDULED" || a.status === "IN_CONSULTATION");
  const completedAppointments = appointments.filter(a => a.status === "COMPLETED");
  const cancelledAppointments = appointments.filter(a => a.status === "CANCELLED" || a.status === "NO_SHOW");

  return (
    <div className="patient-appointments-page animate-fade-in">
      <header className="page-header-top">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={20} />
          <span>Volver al Dashboard</span>
        </button>
        <div className="title-group">
          <CalendarDays className="header-icon" size={32} />
          <h1>Mis Citas Médicas</h1>
        </div>
      </header>

      <div className="appointments-content-area">
        {loading ? (
          <div className="loading-state">Cargando tus citas...</div>
        ) : appointments.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <p>No tienes citas registradas aún.</p>
          </div>
        ) : (
          <div className="appointments-sections">
            
            {/* Pendientes */}
            <section className="appt-section">
              <h2 className="section-title text-blue">
                <AlertCircle size={20} /> Próximas Citas ({pendingAppointments.length})
              </h2>
              <div className="appointments-grid-modern">
                {pendingAppointments.map(a => {
                  const { day, time } = formatDateTime(a.appointmentDate);
                  return (
                    <div key={a.id} className="appt-card-modern pending">
                      <div className="card-top">
                        <span className="status-badge pending">{a.status}</span>
                        <span className="appt-time"><Clock size={16} /> {time} hs</span>
                      </div>
                      <div className="doctor-info-card">
                        <div className="doctor-avatar">Dr</div>
                        <div className="doctor-details">
                          <h3>{a.doctor.name}</h3>
                          <p>{a.doctor.speciality}</p>
                        </div>
                      </div>
                      <div className="date-badge-footer">
                        <Calendar size={14} /> {day}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Atendidas */}
            <section className="appt-section mt-4">
              <h2 className="section-title text-green">
                <CheckCircle size={20} /> Historial / Atendidas ({completedAppointments.length})
              </h2>
              <div className="appointments-grid-modern">
                {completedAppointments.map(a => {
                  const { day, time } = formatDateTime(a.appointmentDate);
                  return (
                    <div key={a.id} className="appt-card-modern completed">
                      <div className="card-top">
                        <span className="status-badge completed">ATENDIDO</span>
                        <span className="appt-time"><Clock size={16} /> {time} hs</span>
                      </div>
                      <div className="doctor-info-card">
                        <div className="doctor-avatar">Dr</div>
                        <div className="doctor-details">
                          <h3>{a.doctor.name}</h3>
                          <p>{a.doctor.speciality}</p>
                        </div>
                      </div>
                      <div className="date-badge-footer">
                        <Calendar size={14} /> {day}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Canceladas o Inasistencias */}
            {cancelledAppointments.length > 0 && (
              <section className="appt-section mt-4">
                <h2 className="section-title text-orange">
                  <AlertCircle size={20} /> Canceladas / Inasistencias ({cancelledAppointments.length})
                </h2>
                <div className="appointments-grid-modern">
                  {cancelledAppointments.map(a => {
                    const { day, time } = formatDateTime(a.appointmentDate);
                    return (
                      <div key={a.id} className="appt-card-modern cancelled">
                        <div className="card-top">
                          <span className="status-badge cancelled">{a.status}</span>
                          <span className="appt-time"><Clock size={16} /> {time} hs</span>
                        </div>
                        <div className="doctor-info-card">
                          <div className="doctor-avatar">Dr</div>
                          <div className="doctor-details">
                            <h3>{a.doctor.name}</h3>
                            <p>{a.doctor.speciality}</p>
                          </div>
                        </div>
                        <div className="date-badge-footer">
                          <Calendar size={14} /> {day}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default PatientAppointments;
