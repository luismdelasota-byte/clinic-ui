import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardList, Calendar, Stethoscope, Search } from "lucide-react";
import { getHistoriesByPatient } from "../../services/clinicalHistoryService";
import { getReportsByPatient } from "../../services/medicalReportService";
import { getLeavesByPatient } from "../../services/medicalLeaveService";
import "../../styles/PatientMedicalHistory.css";

const PatientMedicalHistory: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("diary");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const userRole = localStorage.getItem("role");
  
  // Si hay ID en la URL lo usamos (Admin/Doctor), sino el del paciente logueado
  const patientId = id ? Number(id) : Number(localStorage.getItem("patientId"));

  useEffect(() => {
    if (patientId) {
      loadData();
    }
  }, [patientId, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      let result = [];
      if (activeTab === "diary") result = await getHistoriesByPatient(Number(patientId));
      else if (activeTab === "reports") result = await getReportsByPatient(Number(patientId));
      else if (activeTab === "leaves") result = await getLeavesByPatient(Number(patientId));
      setData(result);
    } catch (error) {
      console.error("Error loading history data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter(h => {
    const term = searchTerm.toLowerCase();
    if (activeTab === "diary") return h.diagnosis.toLowerCase().includes(term) || h.doctor.name.toLowerCase().includes(term);
    if (activeTab === "reports") return h.reason.toLowerCase().includes(term) || h.doctor.name.toLowerCase().includes(term);
    if (activeTab === "leaves") return h.reason.toLowerCase().includes(term) || h.doctor.name.toLowerCase().includes(term);
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="patient-history-wrapper">
      <header className="page-header-top">
        <button className="back-btn" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={20} />
          <span>Volver al Dashboard</span>
        </button>
        <div className="header-main">
          <div className="title-group">
            <ClipboardList className="header-icon" size={32} />
            <h1>Historial Clínico Digital</h1>
          </div>
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Buscar por contenido o doctor..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="history-tabs">
          <button className={activeTab === "diary" ? "active" : ""} onClick={() => setActiveTab("diary")}>Diario Clínico</button>
          {(userRole === "ADMIN" || userRole === "DOCTOR") && (
            <>
              <button className={activeTab === "reports" ? "active" : ""} onClick={() => setActiveTab("reports")}>Informes Médicos</button>
              <button className={activeTab === "leaves" ? "active" : ""} onClick={() => setActiveTab("leaves")}>Descansos Médicos</button>
            </>
          )}
        </div>
      </header>

      <div className="history-content-area animate-fade-in">
        {loading ? (
          <div className="loading-state">Cargando información...</div>
        ) : filteredData.length === 0 ? (
          <div className="empty-state">
            <ClipboardList size={48} />
            <p>No se encontraron registros en esta categoría.</p>
          </div>
        ) : (
          <div className="history-timeline">
            {filteredData.map((h, idx) => (
              <div key={h.id || idx} className="history-item">
                <div className="history-marker">
                  <div className="marker-dot"></div>
                  {idx < filteredData.length - 1 && <div className="marker-line"></div>}
                </div>
                <div className="history-card">
                  <div className="card-header-flex">
                    <div className="date-badge">
                      <Calendar size={14} /> {formatDate(h.createdAt || h.issueDate)}
                    </div>
                    <div className="doctor-badge">
                      <Stethoscope size={14} /> Dr. {h.doctor.name}
                    </div>
                  </div>
                  
                  <div className="card-body-content">
                    {activeTab === "diary" && (
                      <>
                        <div className="content-section">
                          <h4>Diagnóstico</h4>
                          <p>{h.diagnosis}</p>
                        </div>
                        <div className="content-section">
                          <h4>Tratamiento</h4>
                          <p>{h.treatment}</p>
                        </div>
                      </>
                    )}
                    {(activeTab === "reports" || activeTab === "leaves") && (
                      <>
                        <div className="content-section">
                          <h4>Motivo</h4>
                          <p>{h.reason}</p>
                        </div>
                        <div className="content-section">
                          <h4>Descripción / Recomendaciones</h4>
                          <p>{h.description || h.recommendations || "Sin detalles adicionales"}</p>
                        </div>
                        {activeTab === "leaves" && (
                          <div className="content-section">
                            <div className="date-range-badge">
                              Desde: {formatDate(h.startDate)} | Hasta: {formatDate(h.endDate)}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientMedicalHistory;
