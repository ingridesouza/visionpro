const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const defaultWsUrl = `${wsProtocol}//localhost:8000/ws/emotion`;

export const WS_URL = import.meta.env.VITE_WS_URL || defaultWsUrl;
export const CAPTURE_FPS = 3;
export const JPEG_QUALITY = 0.7;
