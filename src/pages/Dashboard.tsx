import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Calendar, Activity, Clock, LogOut,
  Settings, UserPlus, ClipboardList, TrendingUp, Bell, LayoutDashboard, ShieldAlert
} from "lucide-react";
import "../styles/Dashboard.css";
import { getAllDoctors } from "../services/doctorService";
import { getAllPatients } from "../services/patientService";
import { getAllAppointments } from "../services/appointmentService";
import { getAllSchedules } from "../services/schedule/scheduleService";

import { Line } from "react-chartjs-2";
import ClinicalDiaryModal from "../components/modals/ClinicalDiaryModal";
import MedicalLeaveModal from "../components/modals/MedicalLeaveModal";
import MedicalReportModal from "../components/modals/MedicalReportModal";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");

  // --- Estados con datos ---
  const [doctorCount, setDoctorCount] = useState<number>(0);
  const [patientCount, setPatientCount] = useState<number>(0);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [scheduleCount, setScheduleCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // --- Modal ---
  const [docModal, setDocModal] = useState<{ open: boolean; type: string | null }>({ open: false, type: null });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [doctors, patients, appts, schedules] = await Promise.all([
          getAllDoctors(),
          getAllPatients(),
          getAllAppointments(),
          getAllSchedules(),
        ]);
        setDoctorCount(doctors.length);
        setPatientCount(patients.length);
        setAppointments(appts);
        setScheduleCount(schedules.length);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userRole === "ADMIN") loadData();
    else setLoading(false); // Para doctor/paciente omitimos carga pesada global en dashboard inicial
  }, [userRole]);

  // --- Datos del Doctor Logueado ---
  const [doctorData, setDoctorData] = useState<any>(null);
  const doctorId = localStorage.getItem("doctorId");

  useEffect(() => {
    if (userRole === "DOCTOR" && doctorId) {
      const fetchDoctor = async () => {
        try {
          const data = await getAllDoctors();
          const me = data.find((d: any) => d.id === Number(doctorId));
          setDoctorData(me);
        } catch (e) {
          console.error("Error fetching doctor data", e);
        }
      };
      fetchDoctor();
    }
  }, [userRole, doctorId]);

  // --- Notificaciones Reales ---
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (userRole === "DOCTOR" && doctorId) {
      const fetchAppts = async () => {
        try {
          const appts = await getAllAppointments();
          const myAppts = appts
            .filter((a: any) => a.doctor.id === Number(doctorId) && a.status === "SCHEDULED")
            .sort((a: any, b: any) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())
            .slice(0, 3);
          
          const notifs = myAppts.map((a: any) => ({
            id: a.id,
            text: `Cita próxima con ${a.patient.name}`,
            time: new Date(a.appointmentDate).toLocaleString('es-ES', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })
          }));
          setNotifications(notifs);
        } catch (e) {
          console.error("Error fetching notifications", e);
        }
      };
      fetchAppts();
    }
  }, [userRole, doctorId]);

  // --- Indicadores Admin ---
  const today = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter(a => a.date?.startsWith(today));

  /*const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newPatientsWeek = appointments.filter(a => new Date(a.date) >= weekAgo).length;*/

  const days = ["L", "M", "X", "J", "V", "S", "D"];
  const trendData = Array(7).fill(0).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    return appointments.filter(a => a.date?.startsWith(key)).length;
  });

  const patientTrendData = {
    labels: days,
    datasets: [{
      label: "Citas",
      data: trendData,
      fill: true,
      borderColor: "#0F52BA",
      backgroundColor: "rgba(15, 82, 186, 0.1)",
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    }],
  };

  const patientTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "#F1F5F9" } },
      x: { grid: { display: false } }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Activity className="sidebar-logo" size={28} />
          <h2>San Luis</h2>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">MENU PRINCIPAL</div>

          <button className="nav-item active">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>

          {userRole === "ADMIN" && (
            <>
              <button className="nav-item" onClick={() => navigate("/patients")}>
                <Users size={20} />
                <span>Pacientes</span>
              </button>
              <button className="nav-item" onClick={() => navigate("/appointments")}>
                <Calendar size={20} />
                <span>Citas</span>
              </button>
              <button className="nav-item" onClick={() => navigate("/doctors")}>
                <UserPlus size={20} />
                <span>Doctores</span>
              </button>
              <button className="nav-item" onClick={() => navigate("/schedule")}>
                <Clock size={20} />
                <span>Horarios</span>
              </button>
            </>
          )}

          {userRole === "DOCTOR" && (
            <>
              <button className="nav-item" onClick={() => navigate("/doctor/appointments")}>
                <Calendar size={20} />
                <span>Mis Citas</span>
              </button>
              <button className="nav-item" onClick={() => navigate("/patients")}>
                <Users size={20} />
                <span>Pacientes</span>
              </button>
              <button className="nav-item" onClick={() => navigate("/doctor/schedule")}>
                <Clock size={20} />
                <span>Mi Horario</span>
              </button>
            </>
          )}

          {userRole === "PATIENT" && (
            <>
              <button className="nav-item" onClick={() => navigate("/patient/appointments")}>
                <Calendar size={20} />
                <span>Mis Citas</span>
              </button>
              <button className="nav-item" onClick={() => navigate("/patient/history")}>
                <ClipboardList size={20} />
                <span>Historial Médico</span>
              </button>
              <button className="nav-item" onClick={() => navigate("/patient/profile")}>
                <Settings size={20} />
                <span>Mi Perfil</span>
              </button>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="topbar">
          <div className="topbar-left">
            {/* Buscador eliminado por solicitud del usuario */}
          </div>
          <div className="user-profile">
            <div className="notification-wrapper">
              <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} />
                <span className="badge">{notifications.length}</span>
              </button>
              {showNotifications && (
                <div className="notifications-dropdown animate-fade-in">
                  <div className="dropdown-header">Notificaciones</div>
                  <div className="notifications-list">
                    {notifications.map(n => (
                      <div key={n.id} className="notification-item">
                        <p>{n.text}</p>
                        <span>{n.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="avatar">
              {doctorData ? doctorData.name.charAt(0) : userRole?.charAt(0) || "U"}
            </div>
            <div className="user-info-text">
              <span className="user-name">
                {userRole === 'ADMIN' ? 'Administrador' : (doctorData ? doctorData.name : 'Usuario')}
              </span>
              <span className="user-role">{userRole}</span>
            </div>
          </div>
        </header>

        <div className="dashboard-content animate-fade-in">
          <div className="page-header">
            <h1>Bienvenido de nuevo</h1>
            <p>Resumen de actividad y acceso rápido a tus herramientas.</p>
          </div>

          {userRole === "ADMIN" && (
            <>
              {loading ? (
                <div className="loading-state">Cargando datos del panel...</div>
              ) : (
                <>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon-wrapper teal">
                        <Clock size={24} />
                      </div>
                      <div className="stat-info">
                        <h3>Horarios Registrados</h3>
                        <p className="stat-value">{scheduleCount}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon-wrapper blue">
                        <Users size={24} />
                      </div>
                      <div className="stat-info">
                        <h3>Total Pacientes</h3>
                        <p className="stat-value">{patientCount}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon-wrapper green">
                        <Calendar size={24} />
                      </div>
                      <div className="stat-info">
                        <h3>Citas Totales</h3>
                        <p className="stat-value">{appointments.length}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon-wrapper purple">
                        <UserPlus size={24} />
                      </div>
                      <div className="stat-info">
                        <h3>Médicos Activos</h3>
                        <p className="stat-value">{doctorCount}</p>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon-wrapper orange">
                        <Clock size={24} />
                      </div>
                      <div className="stat-info">
                        <h3>Citas Hoy</h3>
                        <p className="stat-value">{todayAppointments.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="dashboard-grid-layout">
                    <div className="chart-section dashboard-card">
                      <div className="card-header">
                        <h3><TrendingUp size={18} /> Tendencia de Citas (7 días)</h3>
                      </div>
                      <div className="chart-container">
                        <Line data={patientTrendData} options={patientTrendOptions} />
                      </div>
                    </div>

                    <div className="action-section dashboard-card">
                      <div className="card-header">
                        <h3>Reportes Rápidos</h3>
                      </div>
                      <div className="report-actions">
                        <button className="report-btn" onClick={() => setDocModal({ open: true, type: "diarioClinico" })}>
                          <ClipboardList size={20} />
                          <span>Diario Clínico</span>
                        </button>
                        <button className="report-btn" onClick={() => setDocModal({ open: true, type: "descansoMedico" })}>
                          <Activity size={20} />
                          <span>Descanso Médico</span>
                        </button>
                        <button className="report-btn" onClick={() => setDocModal({ open: true, type: "informesMedicos" })}>
                          <Users size={20} />
                          <span>Informes Médicos</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {userRole === "DOCTOR" && (
            <div className="role-specific-section">
              {!doctorId && (
                <div className="alert-message error mb-4">
                  <ShieldAlert size={20} />
                  <span>Atención: Su registro médico aún no ha sido completado por el administrador. Las funciones de gestión están limitadas.</span>
                </div>
              )}
              
              <div className="stats-grid">
                <div className={`stat-card ${!doctorId ? 'disabled' : ''}`} onClick={() => doctorId && navigate("/doctor/appointments?mode=view")}>
                  <div className="stat-icon-wrapper blue"><Calendar size={24} /></div>
                  <div className="stat-info"><h3>Mi Agenda</h3><p className="stat-value">Consultar Citas</p></div>
                </div>
                <div className={`stat-card ${!doctorId ? 'disabled' : ''}`} onClick={() => doctorId && navigate("/doctor/appointments?mode=register")}>
                  <div className="stat-icon-wrapper green"><ClipboardList size={24} /></div>
                  <div className="stat-info"><h3>Registrar Cita</h3><p className="stat-value">Agendar Paciente</p></div>
                </div>
                <div className={`stat-card ${!doctorId ? 'disabled' : ''}`} onClick={() => doctorId && navigate("/doctor/schedule")}>
                  <div className="stat-icon-wrapper orange"><Clock size={24} /></div>
                  <div className="stat-info"><h3>Mi Horario</h3><p className="stat-value">Disponibilidad</p></div>
                </div>
              </div>

              {/* Módulo de Gestión Médica */}
              <div className="dashboard-card mt-4">
                <div className="card-header">
                  <h3>Módulo de Gestión Médica</h3>
                </div>
                <div className="quick-actions-grid">
                  <button 
                    className="quick-action-btn" 
                    onClick={() => doctorId && setDocModal({ open: true, type: "diarioClinico" })}
                    disabled={!doctorId}
                  >
                    <ClipboardList size={20} />
                    <span>Diario Clínico</span>
                  </button>
                  <button 
                    className="quick-action-btn" 
                    onClick={() => doctorId && setDocModal({ open: true, type: "descansoMedico" })}
                    disabled={!doctorId}
                  >
                    <Activity size={20} />
                    <span>Descanso Médico</span>
                  </button>
                  <button 
                    className="quick-action-btn" 
                    onClick={() => doctorId && setDocModal({ open: true, type: "informesMedicos" })}
                    disabled={!doctorId}
                  >
                    <Users size={20} />
                    <span>Informes Médicos</span>
                  </button>
                </div>
              </div>

              {/* Actividad Reciente eliminada por solicitud */}
            </div>
          )}

          {userRole === "PATIENT" && (
            <div className="role-specific-section">
              <div className="stats-grid">
                <div className="stat-card" onClick={() => navigate("/patient/appointments")}>
                  <div className="stat-icon-wrapper blue"><Calendar size={24} /></div>
                  <div className="stat-info"><h3>Mis Citas</h3><p className="stat-value">Agendar/Ver</p></div>
                </div>
                <div className="stat-card" onClick={() => navigate("/patient/history")}>
                  <div className="stat-icon-wrapper green"><ClipboardList size={24} /></div>
                  <div className="stat-info"><h3>Historial Clínico</h3><p className="stat-value">Resultados</p></div>
                </div>
                <div className="stat-card" onClick={() => navigate("/patient/profile")}>
                  <div className="stat-icon-wrapper purple"><Settings size={24} /></div>
                  <div className="stat-info"><h3>Mi Perfil</h3><p className="stat-value">Actualizar</p></div>
                </div>
              </div>
              <div className="dashboard-card mt-4">
                <div className="card-header"><h3>Próximos Eventos</h3></div>
                <div className="activity-list">
                  <div className="activity-item">
                    <div className="activity-dot blue-dot"></div>
                    <p>Cita confirmada en Odontología para mañana a las 10:00 AM</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modales Avanzados */}
      {docModal.open && docModal.type === "diarioClinico" && (
        <ClinicalDiaryModal isOpen={true} onClose={() => setDocModal({ open: false, type: null })} />
      )}
      {docModal.open && docModal.type === "descansoMedico" && (
        <MedicalLeaveModal isOpen={true} onClose={() => setDocModal({ open: false, type: null })} />
      )}
      {docModal.open && docModal.type === "informesMedicos" && (
        <MedicalReportModal isOpen={true} onClose={() => setDocModal({ open: false, type: null })} />
      )}
    </div>
  );
};

export default Dashboard;