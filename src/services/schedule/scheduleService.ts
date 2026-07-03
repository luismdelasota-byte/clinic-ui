import api from "./api";

// Listar todos los horarios
export const getAllSchedules = async () => {
  const response = await api.get("/api/schedules");
  return response.data;
};

// Crear un horario
export const saveSchedule = async (schedule: any) => {
  const response = await api.post("/api/schedules", schedule);
  return response.data;
};

// Actualizar un horario
export const updateSchedule = async (id: number, schedule: any) => {
  const response = await api.put(`/api/schedules/${id}`, schedule);
  return response.data;
};

// Eliminar un horario
export const deleteSchedule = async (id: number) => {
  await api.delete(`/api/schedules/${id}`);
};

// Obtener horarios por doctor
export const getSchedulesByDoctor = async (doctorId: number) => {
  const response = await api.get(`/api/schedules/doctor/${doctorId}`);
  return response.data;
};
