import { useRef, useState, useCallback, useEffect } from "react";
import type { EmotionResult } from "../types/emotion";

export type WSStatus = "connecting" | "connected" | "disconnected" | "error";

const BASE_RECONNECT_DELAY = 2000;
const MAX_RECONNECT_DELAY = 30000;

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const awaitingResponseRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const connectRef = useRef<() => void>(null);
  const [status, setStatus] = useState<WSStatus>("disconnected");
  const [lastResult, setLastResult] = useState<EmotionResult | null>(null);

  const cleanupWs = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        wsRef.current.close();
      }
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    const state = wsRef.current?.readyState;
    if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) return;

    cleanupWs();
    setStatus("connecting");
    awaitingResponseRef.current = false;

    const ws = new WebSocket(url);

    ws.onopen = () => {
      reconnectAttemptsRef.current = 0;
      setStatus("connected");
    };

    ws.onmessage = (event) => {
      try {
        const data: EmotionResult = JSON.parse(event.data);
        setLastResult(data);
      } catch {
        /* ignore malformed messages */
      }
      awaitingResponseRef.current = false;
    };

    ws.onerror = () => {
      setStatus("error");
    };

    ws.onclose = () => {
      wsRef.current = null;
      setStatus((prev) => (prev === "error" ? "error" : "disconnected"));

      const attempts = reconnectAttemptsRef.current;
      const delay = Math.min(
        BASE_RECONNECT_DELAY * Math.pow(2, attempts),
        MAX_RECONNECT_DELAY,
      );
      reconnectAttemptsRef.current = attempts + 1;
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connectRef.current?.();
      }, delay);
    };

    wsRef.current = ws;
  }, [url, cleanupWs]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  const sendFrame = useCallback((frameBase64: string) => {
    if (wsRef.current?.readyState !== WebSocket.OPEN) return;
    if (awaitingResponseRef.current) return;
    awaitingResponseRef.current = true;
    wsRef.current.send(JSON.stringify({ frame: frameBase64 }));
  }, []);

  const disconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    cleanupWs();
    setStatus("disconnected");
  }, [cleanupWs]);

  useEffect(() => {
    return () => {
      cleanupWs();
    };
  }, [cleanupWs]);

  return { status, lastResult, connect, disconnect, sendFrame };
}
