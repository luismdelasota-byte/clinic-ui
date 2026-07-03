import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Stethoscope, User } from "lucide-react";
import "../styles/RoleSelection.css";

const RoleSelection: React.FC = () => {
  const navigate = useNavigate();

  const handleRoleClick = (role: string) => {
    localStorage.setItem("selectedRole", role);
    navigate("/login");
  };

  return (
    <div className="role-selection-wrapper">
      <div className="role-selection-container animate-fade-in">
        <header className="role-header">
          <div className="logo-icon">
            <Stethoscope size={40} color="var(--primary-color)" />
          </div>
          <h1>Clínica San Luis</h1>
          <p className="subtitle">Por favor, seleccione su rol para ingresar al sistema</p>
        </header>

        <div className="role-grid">
          <button className="role-card" onClick={() => handleRoleClick("ADMIN")}>
            <div className="icon-wrapper admin-icon">
              <ShieldCheck size={32} />
            </div>
            <h3>Administrador</h3>
            <p>Gestión total del sistema, pacientes y horarios.</p>
          </button>

          <button className="role-card" onClick={() => handleRoleClick("DOCTOR")}>
            <div className="icon-wrapper doctor-icon">
              <Stethoscope size={32} />
            </div>
            <h3>Médico</h3>
            <p>Acceso a citas, pacientes e informes médicos.</p>
          </button>
          
          <button className="role-card" onClick={() => handleRoleClick("PATIENT")}>
            <div className="icon-wrapper patient-icon">
              <User size={32} />
            </div>
            <h3>Paciente</h3>
            <p>Consulta tus citas, perfil y resultados.</p>
          </button>
        </div>
      </div>
      
      <div className="role-footer">
        <p>&copy; {new Date().getFullYear()} Clínica San Luis. Todos los derechos reservados.</p>
      </div>
    </div>
  );
};

export default RoleSelection;