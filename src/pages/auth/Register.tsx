import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, ArrowLeft, UserPlus } from "lucide-react";
import api from "../services/api.ts";
import "../styles/Register.css";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    try {
      await api.post("/auth/register", {
        username,
        email,
        password,
        role: "PATIENT",
      });
      navigate("/login");
    } catch (error: any) {
      if (error.response && error.response.data) {
        setErrorMsg(typeof error.response.data === 'string' ? error.response.data : "Error al registrar. Verifica tus datos.");
      } else {
        setErrorMsg("Error de conexión al registrar. ¿Está el backend encendido?");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-wrapper">
      <div className="register-container animate-fade-in">
        
        <div className="register-form-section">
          <button className="back-button" onClick={() => navigate("/login")}>
            <ArrowLeft size={20} />
            <span>Volver al Login</span>
          </button>

          <div className="register-form-content">
            <div className="register-header">
              <div className="icon-badge">
                <UserPlus size={24} />
              </div>
              <h2>Crear Cuenta</h2>
              <p>Únete a nuestra plataforma médica integral</p>
            </div>

            {errorMsg && (
              <div className="error-alert animate-fade-in">
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="register-form">
              <div className="input-group">
                <label>Nombre de Usuario</label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Ej: juanperez88"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Correo Electrónico</label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

              {/* Solo se permite registro de PACIENTES públicamente */}
              <input type="hidden" value="PATIENT" />

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? "Registrando..." : "Registrarse"}
              </button>

              <div className="login-prompt">
                <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión aquí</Link></p>
              </div>
            </form>
          </div>
        </div>

        <div className="register-image-section">
          <div className="register-overlay">
            <h2>Tu salud, nuestra prioridad</h2>
            <p>Regístrate para gestionar tus citas y acceder a tu historial médico desde cualquier lugar.</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
