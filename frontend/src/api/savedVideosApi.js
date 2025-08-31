// src/api/savedVideosApi.js
import useAxios from "../utils/useAxios";

export const savedVideosApi = () => {
  const api = useAxios();

  const listSaved = async () => {
    const r = await api.get("me/saved-videos/");
    return Array.isArray(r.data) ? r.data : r.data?.results || [];
  };

  // kind: "link" | "file", video_id: number
  const addSaved = async ({ kind, video_id }) => {
    return api.post("me/saved-videos/", { kind, video_id });
  };

  const removeSaved = async (savedId) => {
    return api.delete(`me/saved-videos/${savedId}/delete/`);
  };

  return { listSaved, addSaved, removeSaved };
};
