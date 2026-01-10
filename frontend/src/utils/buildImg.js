// src/utils/buildImg.js

// Burayı kendine göre değiştir:
// - public içine img koyduysan: const FALLBACK_IMG = "/img/placeholder.png";
// - Django static'ten veriyorsan: const FALLBACK_IMG = "http://127.0.0.1:8000/static/img/placeholder.png";
const FALLBACK_IMG = "http://127.0.0.1:8000/static/img/placeholder.png";

export function buildImg(url) {
  if (!url) return FALLBACK_IMG;

  // Tam URL geldiyse
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Backend relative veriyorsa
  // /media/...  /static/... gibi
  return `http://127.0.0.1:8000${url}`;
}

export const FALLBACK_SRC = FALLBACK_IMG;
