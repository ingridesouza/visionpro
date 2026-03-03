import type { WSStatus } from "../hooks/useWebSocket";

interface Props {
  status: WSStatus;
}

const STATUS_MAP: Record<WSStatus, { label: string; hint?: string; className: string }> = {
  connected: { label: "Conectado", className: "status-connected" },
  connecting: { label: "Conectando...", className: "status-connecting" },
  disconnected: { label: "Desconectado", className: "status-disconnected" },
  error: {
    label: "Servidor indisponivel",
    hint: "Verifique se o backend esta rodando",
    className: "status-error",
  },
};

export function ConnectionStatus({ status }: Props) {
  const { label, hint, className } = STATUS_MAP[status];

  return (
    <div className={`connection-status ${className}`}>
      <span className="status-dot" />
      <span>{label}</span>
      {hint && <span className="status-hint">{hint}</span>}
    </div>
  );
}
