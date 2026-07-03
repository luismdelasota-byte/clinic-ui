import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldAlert, User, Lock, ArrowLeft } from "lucide-react";
import api from "../services/api";
import "../styles/Login.css";

const Login: React.FC = () => {
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Rol seleccionado desde la pantalla anterior
  const selectedRole = localStorage.getItem("selectedRole");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        usernameOrEmail,
        password,
      });

      const realRole = response.data.role.toUpperCase();

      if (selectedRole && selectedRole !== realRole) {
        setErrorMsg("Usted pertenece a otro rol.");
        setLoading(false);
        return;
      }

      // Si todo está bien
      localStorage.removeItem("selectedRole");
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", realRole);

      //guardar doctorId si el rol es DOCTOR
      if (realRole === "DOCTOR" && response.data.doctorId) {
        localStorage.setItem("doctorId", response.data.doctorId);
      }

      //guardar patientId si el rol es PATIENT
      if (realRole === "PATIENT" && response.data.patientId) {
        localStorage.setItem("patientId", response.data.patientId);
      }

      navigate("/dashboard");
    } catch (error: any) {
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        setErrorMsg(`Error: Credenciales incorrectas. (Status: ${error.response.status})`);
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta (ej. servidor apagado o CORS)
        setErrorMsg("Error de red: No se pudo conectar al servidor. Verifica tu conexión o si el backend está activo.");
      } else {
        setErrorMsg("Error desconocido al intentar iniciar sesión.");
      }
      console.error("Detalle del error en login:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = () => {
    switch (selectedRole) {
      case "ADMIN": return "Administrador";
      case "DOCTOR": return "Médico";
      case "PATIENT": return "Paciente";
      default: return "Usuario";
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container animate-fade-in">
        <div className="login-image-section">
          <div className="login-overlay">
            <h2>Bienvenido a Clínica San Luis</h2>
            <p>Acceso seguro para nuestro personal y pacientes.</p>
          </div>
        </div>

        <div className="login-form-section">
          <button className="back-button" onClick={() => navigate("/")}>
            <ArrowLeft size={20} />
            <span>Volver a Roles</span>
          </button>

          <div className="login-form-content">
            <div className="login-header">
              <h2>Iniciar Sesión</h2>
              {selectedRole && (
                <div className="role-badge">
                  Ingresando como: <strong>{getRoleLabel()}</strong>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="error-alert animate-fade-in">
                <ShieldAlert size={20} />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label>Usuario o Email</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Ingrese su usuario"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Contraseña</label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Ingresando..." : "Ingresar"}
              </button>

              <div className="register-prompt">
                <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
