const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const analyzePitch = async (formData) => {
  const response = await axios.post(`${API_URL}/analyze-pitch/`, formData);
  return response.data;
}; 