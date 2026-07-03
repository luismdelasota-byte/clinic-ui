import React, { useState, useEffect } from "react";
import { X, Search, User, FileBadge } from "lucide-react";
import { getAllPatients } from "../../services/patientService";
import { saveMedicalLeave } from "../../services/medical/medicalLeaveService";
import "../../styles/modals.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: number;
  patientId?: number;
  doctorId?: number;
}

const MedicalLeaveModal: React.FC<Props> = ({ isOpen, onClose, patientId, doctorId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (patientId) fetchPatient(patientId);
    }
  }, [isOpen, patientId]);

  const fetchPatient = async (pid: number) => {
    const pts = await getAllPatients();
    const p = pts.find((pt: any) => pt.id === pid);
    if (p) setSelectedPatient(p);
  };

  const handleSave = async () => {
    if (!reason || !startDate || !endDate) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }

    setIsSaving(true);
    try {
      await saveMedicalLeave({
        patient: { id: patientId || selectedPatient.id },
        doctor: { id: doctorId },
        reason,
        startDate,
        endDate,
        recommendations,
        issueDate: new Date().toISOString()
      });
      alert("Descanso médico guardado correctamente.");
      onClose();
    } catch (error) {
      console.error("Error saving medical leave:", error);
      alert("Error al guardar el descanso médico.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    const pts = await getAllPatients();
    setPatients(pts);
  };

  if (!isOpen) return null;

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectPatient = (patient: any) => {
    setSelectedPatient(patient);
    setSearchTerm("");
  };

  return (
    <div className="fullscreen-modal-overlay animate-fade-in" onClick={onClose}>
      <div className="fullscreen-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2><FileBadge size={24} color="#00A86B" /> Descansos Médicos</h2>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </div>

        <div className="modal-body">
          {/* Buscador */}
          <div className="patient-search-section">
            <h3 style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>Buscar Paciente</h3>
            <div className="search-input-wrapper">
              <Search size={20} className="text-muted" />
              <input 
                type="text" 
                placeholder="Ingresa nombre o correo del paciente..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Resultados Rápidos */}
            {searchTerm && filteredPatients.length > 0 && (
              <div style={{ marginTop: "1rem", background: "white", border: "1px solid #E2E8F0", borderRadius: "8px", maxHeight: "150px", overflowY: "auto" }}>
                {filteredPatients.map(p => (
                  <div key={p.id} 
                       style={{ padding: "10px 15px", cursor: "pointer", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", gap: "10px" }}
                       onClick={() => handleSelectPatient(p)}
                       onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#F8FAFC"}
                       onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    <User size={16} /> <strong>{p.name}</strong> - {p.email}
                  </div>
                ))}
              </div>
            )}

            {/* Paciente Seleccionado */}
            {selectedPatient && (
              <div className="selected-patient-card animate-fade-in" style={{ borderColor: "rgba(0, 168, 107, 0.2)", backgroundColor: "rgba(0, 168, 107, 0.05)" }}>
                <div style={{ backgroundColor: "#00A86B", color: "white", width: "40px", height: "40px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold" }}>
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ color: "#006d45", margin: 0 }}>{selectedPatient.name}</h4>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>{selectedPatient.email} | {selectedPatient.phone}</p>
                </div>
                <button 
                  style={{ marginLeft: "auto", background: "transparent", border: "1px solid #00A86B", color: "#00A86B", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                  onClick={() => setSelectedPatient(null)}
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          {/* Formulario de Descanso */}
          {selectedPatient ? (
            <div className="modal-form-area">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "1rem" }}>
                <FileBadge size={20} color="#D97706" /> Emitir Descanso Médico
              </h3>

              <div className="form-content animate-fade-in">
                <div className="input-group">
                  <label>Motivo / Diagnóstico</label>
                  <input 
                    type="text"
                    placeholder="Ej. Descanso por COVID-19, Post-operatorio..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Fecha Inicio</label>
                    <input 
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="input-group">
                    <label>Fecha Fin</label>
                    <input 
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Recomendaciones Adicionales</label>
                  <textarea 
                    placeholder="Escribe recomendaciones para el paciente durante su descanso..."
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="modal-actions">
                  <button className="btn-cancel" onClick={onClose}>Cancelar</button>
                  <button className="btn-primary" style={{ background: "#D97706" }} onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Guardar Descanso"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", color: "var(--text-muted)", flexDirection: "column", gap: "10px" }}>
              <Search size={48} opacity={0.2} />
              <p>Busca y selecciona un paciente para emitir un nuevo Descanso Médico.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MedicalLeaveModal;
