import api from "./api";

export const getLeavesByPatient = async (patientId: number) => {
  const response = await api.get(`/api/medical-leaves/patient/${patientId}`);
  return response.data;
};

export const saveMedicalLeave = async (leave: any) => {
  const response = await api.post("/api/medical-leaves", leave);
  return response.data;
};
