import React, { useState, useEffect } from "react";
import { X, Search, User, ClipboardList, Stethoscope } from "lucide-react";
import { getAllPatients } from "../../services/patientService";
import { saveClinicalHistory } from "../../services/history/clinicalHistoryService";
import "../../styles/modals.css";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  appointmentId?: number;
  patientId?: number;
  doctorId?: number;
}

const ClinicalDiaryModal: React.FC<Props> = ({ isOpen, onClose, patientId, doctorId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [treatment, setTreatment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
      if (patientId) {
        fetchPatientAndAppts(patientId);
      }
    }
  }, [isOpen, patientId]);

  const fetchPatientAndAppts = async (pid: number) => {
    try {
      const pts = await getAllPatients();
      const p = pts.find((pt: any) => pt.id === pid);
      if (p) setSelectedPatient(p);
    } catch (error) {
      console.error("Error fetching patient details:", error);
    }
  };

  const handleSave = async () => {
    if (!diagnosis || !treatment) {
      alert("Por favor completa el diagnóstico y el tratamiento.");
      return;
    }

    setIsSaving(true);
    try {
      await saveClinicalHistory({
        patient: { id: patientId || selectedPatient.id },
        doctor: { id: doctorId },
        diagnosis,
        treatment,
        createdAt: new Date().toISOString()
      });
      alert("Diario clínico guardado correctamente.");
      onClose();
    } catch (error) {
      console.error("Error saving clinical history:", error);
      alert("Error al guardar el diario clínico.");
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
          <h2><ClipboardList size={24} /> Diario Clínico</h2>
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
                <div style={{ backgroundColor: "var(--primary-color)", color: "white", width: "40px", height: "40px", borderRadius: "50%", display: "flex", justifyContent: "center", alignItems: "center", fontWeight: "bold" }}>
                  {selectedPatient.name.charAt(0)}
                </div>
                <div>
                  <h4 style={{ color: "var(--primary-dark)", margin: 0 }}>{selectedPatient.name}</h4>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-muted)" }}>{selectedPatient.email} | {selectedPatient.phone}</p>
                </div>
                <button
                  style={{ marginLeft: "auto", background: "transparent", border: "1px solid var(--primary-color)", color: "var(--primary-color)", padding: "5px 10px", borderRadius: "4px", cursor: "pointer" }}
                  onClick={() => setSelectedPatient(null)}
                >
                  Cambiar
                </button>
              </div>
            )}
          </div>

          {/* Historial del Paciente o Formulario de Registro */}
          {selectedPatient ? (
            <div className="modal-form-area">
              <h3 style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "1rem" }}>
                <Stethoscope size={20} color="var(--primary-color)" /> Registrar Diario Clínico
              </h3>
              
              <div className="form-content animate-fade-in">
                <div className="input-group">
                  <label>Diagnóstico</label>
                  <textarea 
                    placeholder="Describe el diagnóstico del paciente..."
                    value={diagnosis}
                    onChange={(e) => setDiagnosis(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="input-group">
                  <label>Tratamiento y Receta</label>
                  <textarea 
                    placeholder="Detalla el tratamiento y medicamentos..."
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    rows={6}
                  />
                </div>

                <div className="modal-actions">
                  <button className="btn-cancel" onClick={onClose}>Cancelar</button>
                  <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? "Guardando..." : "Guardar Diario"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", color: "var(--text-muted)", flexDirection: "column", gap: "10px" }}>
              <Search size={48} opacity={0.2} />
              <p>Busca y selecciona un paciente para registrar su Diario Clínico.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ClinicalDiaryModal;
