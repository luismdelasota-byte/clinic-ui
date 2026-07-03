import React, { useState, useEffect } from "react";
import { X, Search, User, ClipboardPlus, FileText } from "lucide-react";
import { getAllPatients } from "../../services/patientService";
import { saveMedicalReport } from "../../services/medical/medicalReportService";
import "../../styles/modals.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: number;
  patientId?: number;
  doctorId?: number;
}

const MedicalReportModal: React.FC<Props> = ({ isOpen, onClose, patientId, doctorId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
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
    if (!reason || !description) {
      alert("Por favor completa el motivo y la descripción.");
      return;
    }

    setIsSaving(true);
    try {
      await saveMedicalReport({
        patient: { id: patientId || selectedPatient.id },
        doctor: { id: doctorId },
        reason,
        description,
        issueDate: new Date().toISOString()
      });
      alert("Informe médico guardado correctamente.");
      onClose();
    } catch (error) {
      console.error("Error saving medical report:", error);
      alert("Error al guardar el informe médico.");
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
          <h2><ClipboardPlus size={24} color="#0F52BA" /> Informes Médicos y Referencias</h2>
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
              <div className="selected-patient-card animate-fade-in">
                <div style={{ backgroundColor: "#0F52BA", color: "white", width: "40px", height: "40px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold" }}>
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ color: "#0F52BA", margin: 0 }}>{selectedPatient.name}</h4>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>{selectedPatient.email} | Nacimiento: {selectedPatient.birthDate}</p>
                </div>
                <button
                  style={{ marginLeft: "auto", background: "transparent", border: "1px solid #0F52BA", color: "#0F52BA", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                  onClick={() => setSelectedPatient(null)}
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          {/* Formulario de Reporte */}
          {selectedPatient ? (
            <div className="modal-form-area">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "1rem" }}>
                <FileText size={20} color="#0F52BA" /> Redactar Informe Médico
              </h3>

              <div className="form-content animate-fade-in">
                <div className="input-group">
                  <label>Motivo del Informe</label>
                  <input 
                    type="text"
                    placeholder="Ej. Referencia a especialidad, Resumen de alta..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <div className="input-group">
                  <label>Descripción y Recomendaciones</label>
                  <textarea 
                    placeholder="Escribe el contenido detallado del informe..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={8}
                  />
                </div>

                <div className="modal-actions">
                  <button className="btn-cancel" onClick={onClose}>Cancelar</button>
                  <button className="btn-primary" style={{ background: "#0F52BA" }} onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Guardar Informe"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", color: "var(--text-muted)", flexDirection: "column", gap: "10px" }}>
              <Search size={48} opacity={0.2} />
              <p>Busca y selecciona un paciente para emitir un nuevo Informe Médico.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default MedicalReportModal;
