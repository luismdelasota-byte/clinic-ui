import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoleSelection from "./pages/auth/RoleSelection";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/auth/Register";
import ManagePatients from "./pages/patients/ManagePatients";
import ManageSchedule from "./pages/schedule/ManageSchedule";
import ManageDoctors from "./pages/doctors/ManageDoctors";
import ManageAppointments from "./pages/appointments/ManageAppointments";
import RegisterPatients from "./pages/patients/RegisterPatients";
import DoctorAppointments from "./pages/appointments/DoctorAppointments";
import DoctorScheduleView from "./pages/schedule/DoctorScheduleView";
import PatientAppointments from "./pages/appointments/PatientAppointments";
import PatientMedicalHistory from "./pages/history/PatientMedicalHistory";
import PatientProfile from "./pages/patients/PatientProfile";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/register" element={<Register />}/>
        <Route path="/patients" element = {<ManagePatients/>}/>
        <Route path="/patients/register" element={<RegisterPatients/>} />
        <Route path="/patients/citas" element={<PatientAppointments />} />
        <Route path="/doctors" element = {<ManageDoctors/>}/>
        <Route path="/schedule" element = {<ManageSchedule/>}/>
        <Route path="/appointments" element = {<ManageAppointments/>}/>
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        <Route path="/doctor/schedule" element={<DoctorScheduleView />} />
        <Route path="/patient/appointments" element={<PatientAppointments />} />
        <Route path="/patient/history" element={<PatientMedicalHistory />} />
        <Route path="/patients/:id/history" element={<PatientMedicalHistory />} />
        <Route path="/patient/profile" element={<PatientProfile />} />
      </Routes>
    </Router>
  );
};

export default App;