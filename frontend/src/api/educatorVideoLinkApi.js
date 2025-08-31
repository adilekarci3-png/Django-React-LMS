import useAxios from "../utils/useAxios";

// src/api/educatorVideoLinkApi.js
const LIST = "/educator/video/link/";
const CREATE = "/educator/video/link/create/";
const UPDATE = (id) => `/educator/video/link/${id}/update/`;
const DELETE_ = (id) => `/educator/video/link/${id}/delete/`;
const ROLE_DETAIL = "/user-role-detail/"; // Koordinatör/Teacher göstermek için

export const listVideoLinks = async (params = {}) => {
  const { data } = await useAxios().get(LIST, { params });
  return data;
};
export const createVideoLink = async (payload) => {
  const { data } = await useAxios().post(CREATE, payload);
  return data;
};
export const updateVideoLink = async (id, payload) => {
  const { data } = await useAxios().get(UPDATE(id), payload);
  return data;
};
export const deleteVideoLink = async (id) => {
  await useAxios().get(DELETE_(id));
};
export const fetchRoleDetail = async () => {
  const { data } = await useAxios().get(ROLE_DETAIL);
  return data; // { base_roles: [...], sub_roles: [...] }
};
