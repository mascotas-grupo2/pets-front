import axiosInstance from "./axios";

const axios = axiosInstance;

export const getAllPets = async () => {
  try {
    const response = await axios.get(`mascotas/`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getIdPets = async (id: number) => {
  try {
    const response = await axios.get(`mascotas/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
