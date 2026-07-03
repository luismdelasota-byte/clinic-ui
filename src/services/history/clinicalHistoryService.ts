import api from "./api";

export const getHistoriesByPatient = async (patientId: number) => {
  const response = await api.get(`/api/clinical-histories/patient/${patientId}`);
  return response.data;
};

export const saveClinicalHistory = async (history: any) => {
  const response = await api.post("/api/clinical-histories", history);
  return response.data;
};
