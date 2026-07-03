import api from "./api";

export const getReportsByPatient = async (patientId: number) => {
  const response = await api.get(`/api/medical-reports/patient/${patientId}`);
  return response.data;
};

export const saveMedicalReport = async (report: any) => {
  const response = await api.post("/api/medical-reports", report);
  return response.data;
};
