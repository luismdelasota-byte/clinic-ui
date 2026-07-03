import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllSchedules, saveSchedule, deleteSchedule } from "../../services/scheduleService";
import api from "../../services/api";
import { ArrowLeft, Clock, Plus, X, Edit2, Trash2, Save, Calendar, User, Stethoscope } from "lucide-react";
import "../../styles/schedule.css";
// Reutilizamos estilos base
import "../../styles/patients.css";

interface Schedule {
  id?: number;
  doctor: { id: number; name: string };
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const ManageSchedule: React.FC = () => {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Schedule | null>(null);

  // Nuevo registro (cuando no estamos en modo edición)
  const [newSchedule, setNewSchedule] = useState<Schedule>({
    doctor: { id: 0, name: "" },
    dayOfWeek: "",
    startTime: "",
    endTime: ""
  });

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    loadSchedules();
    fetchDoctors();
  }, []);

  const loadSchedules = async () => {
    const data = await getAllSchedules();
    setSchedules(data);
  };

  const fetchDoctors = async () => {
    const response = await api.get("/api/doctors");
    setDoctors(response.data);
  };

  const handleSaveNew = async () => {
    if (!newSchedule.doctor.id || !newSchedule.dayOfWeek || !newSchedule.startTime || !newSchedule.endTime) {
      alert("Completa todos los campos");
      return;
    }
    await saveSchedule(newSchedule);
    setNewSchedule({ doctor: { id: 0, name: "" }, dayOfWeek: "", startTime: "", endTime: "" });
    setShowAddForm(false);
    loadSchedules();
  };

  const handleSaveEdit = async () => {
    if (editData) {
      await saveSchedule(editData);
      setEditingId(null);
      setEditData(null);
      loadSchedules();
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar este horario?")) {
      await deleteSchedule(id);
      loadSchedules();
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingId(schedule.id!);
    setEditData({ ...schedule });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData(null);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSchedules = schedules.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(schedules.length / itemsPerPage);

  const daysOfWeek = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"];

  return (
    <div className="management-page animate-fade-in">
      <header className="page-header-top">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={20} />
          <span>Volver al Dashboard</span>
        </button>
        <div className="title-section">
          <Clock size={28} className="title-icon" />
          <h1>Horarios de Médicos</h1>
        </div>
      </header>

      <div className="management-container">
        {/* Controles */}
        <div className="controls-bar" style={{ justifyContent: "flex-end" }}>
          {userRole === "ADMIN" && (
            <button className="btn-primary flex-center" onClick={() => setShowAddForm(!showAddForm)}>
              {showAddForm ? <X size={20} /> : <Plus size={20} />}
              <span>{showAddForm ? "Cancelar" : "Nuevo Horario"}</span>
            </button>
          )}
        </div>

        {/* Formulario desplegable */}
        {showAddForm && userRole === "ADMIN" && (
          <div className="card-form animate-fade-in">
            <h3>Registrar Nuevo Horario</h3>
            <div className="form-grid">
              <div className="input-group">
                <label>Doctor</label>
                <div className="input-wrapper">
                  <Stethoscope size={18} className="input-icon" />
                  <select 
                    className="custom-select"
                    value={newSchedule.doctor.id || ""}
                    onChange={(e) => setNewSchedule({ ...newSchedule, doctor: { id: Number(e.target.value), name: "" } })}
                  >
                    <option value="">Seleccione un doctor</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>{doc.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Día de la semana</label>
                <div className="input-wrapper">
                  <Calendar size={18} className="input-icon" />
                  <select 
                    className="custom-select"
                    value={newSchedule.dayOfWeek}
                    onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: e.target.value })}
                  >
                    <option value="">Seleccione día</option>
                    {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label>Hora Inicio</label>
                <div className="input-wrapper">
                  <Clock size={18} className="input-icon" />
                  <input type="time" value={newSchedule.startTime} 
                    onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })} />
                </div>
              </div>

              <div className="input-group">
                <label>Hora Fin</label>
                <div className="input-wrapper">
                  <Clock size={18} className="input-icon" />
                  <input type="time" value={newSchedule.endTime} 
                    onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn-primary" onClick={handleSaveNew}>Guardar Horario</button>
            </div>
          </div>
        )}

        {/* Tabla Moderna */}
        <div className="table-card">
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Médico</th>
                  <th>Día</th>
                  <th>Horario (Inicio - Fin)</th>
                  <th className="text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center empty-state">No hay horarios registrados.</td>
                  </tr>
                ) : (
                  currentSchedules.map((s) => (
                    <tr key={s.id}>
                      {editingId === s.id ? (
                        <>
                          <td>
                            <select className="edit-input" value={editData?.doctor.id}
                              onChange={(e) => setEditData({ ...editData!, doctor: { id: Number(e.target.value), name: "" } })}>
                              {doctors.map((doc) => (
                                <option key={doc.id} value={doc.id}>{doc.name}</option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <select className="edit-input" value={editData?.dayOfWeek}
                              onChange={(e) => setEditData({ ...editData!, dayOfWeek: e.target.value })}>
                              {daysOfWeek.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                          </td>
                          <td>
                            <div className="edit-contact-group flex-row">
                              <input type="time" className="edit-input" value={editData?.startTime}
                                onChange={(e) => setEditData({ ...editData!, startTime: e.target.value })} />
                              <span>-</span>
                              <input type="time" className="edit-input" value={editData?.endTime}
                                onChange={(e) => setEditData({ ...editData!, endTime: e.target.value })} />
                            </div>
                          </td>
                          <td className="actions text-right">
                            <div className="action-buttons">
                              <button className="btn-icon save-btn" title="Guardar" onClick={handleSaveEdit}>
                                <Save size={18} />
                              </button>
                              <button className="btn-icon cancel-btn" title="Cancelar" onClick={handleCancel}>
                                <X size={18} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>
                            <div className="flex-center" style={{ justifyContent: "flex-start", gap: "0.75rem" }}>
                              <div className="avatar-small bg-blue"><User size={14}/></div>
                              <span className="font-medium text-main">{s.doctor.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="day-badge">{s.dayOfWeek}</span>
                          </td>
                          <td>
                            <div className="contact-info">
                              <span className="contact-item"><Clock size={14} /> {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}</span>
                            </div>
                          </td>
                          <td className="actions text-right">
                            <div className="action-buttons">
                              <button className="btn-icon edit-btn" title="Editar" onClick={() => handleEdit(s)}>
                                <Edit2 size={18} />
                              </button>
                              {userRole === "ADMIN" && (
                                <button className="btn-icon delete-btn" title="Eliminar" onClick={() => handleDelete(s.id!)}>
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Anterior</button>
              <div className="page-indicators">
                {Array.from({length: totalPages}, (_, i) => i + 1).map(num => (
                  <button key={num} className={`page-dot ${currentPage === num ? 'active' : ''}`} onClick={() => setCurrentPage(num)}>
                    {num}
                  </button>
                ))}
              </div>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Siguiente</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSchedule;
