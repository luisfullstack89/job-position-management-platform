import axios from 'axios';
import { Position } from '../interfaces/Position';
// const API_URL = 'https://localhost:7154/api/positions'; // this url is for locally runing the api
const API_URL = 'http://localhost:5235/api/positions';


export const fetchPositions = async () => {
  const response = await axios.get<Position[]>(API_URL);
  return response.data;
};

export const createPosition = async (position: Position) => {
  const response = await axios.post<Position>(API_URL, position);
  return response.data;
};

export const updatePosition = async (id: number, position: Position) => {
  const response = await axios.put<Position>(`${API_URL}/${id}`, position);
  return response.data;
};

export const deletePosition = async (id: number) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};
