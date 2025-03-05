// src/api.js
import axios from 'axios';
import useAxios from "../utils/useAxios";

export const createHafizBilgi = async (values) => {
  const formdata = new FormData();
  Object.keys(values).forEach(key => formdata.append(key, values[key]));
  formdata.append("active", true);
  formdata.append("country", 1);

  return await axios.post('http://127.0.0.1:8000/api/v1/hafizbilgi/create/', formdata);
};

export const updateHafizBilgi = async (agent, id, values) => {  
  return await useAxios().put(`agent/hafizbilgi-update/${agent}/${id}/`, values);
};

export const deleteHafizBilgi = async (id) => {
  return await useAxios().delete(`agent/hafizbilgi-delete/${id}/`);
};

export const fetchMesleks = async () => {
  const res = await useAxios().get('job/list/');
  return res.data;
};

export const fetchIller = async () => {
  const res = await useAxios().get('city/list/');
  return res.data;
};

export const fetchIlceler = async () => {
  const res = await useAxios().get('district/list/');
  return res.data;
};
