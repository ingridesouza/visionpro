import type { WSStatus } from "../hooks/useWebSocket";
import { t } from "../lib/i18n";

interface Props {
  status: WSStatus;
}

const STATUS_MAP: Record<WSStatus, { labelKey: string; hintKey?: string; className: string }> = {
  connected: { labelKey: "status.connected", className: "status-connected" },
  connecting: { labelKey: "status.connecting", className: "status-connecting" },
  disconnected: { labelKey: "status.disconnected", className: "status-disconnected" },
  error: {
    labelKey: "status.error",
    hintKey: "status.error.hint",
    className: "status-error",
  },
};

export function ConnectionStatus({ status }: Props) {
  const { labelKey, hintKey, className } = STATUS_MAP[status];
  const label = t(labelKey);
  const hint = hintKey ? t(hintKey) : undefined;

  return (
    <div
      className={`connection-status ${className}`}
      role="status"
      aria-live="polite"
      aria-label={`${label}${hint ? ` — ${hint}` : ""}`}
    >
      <span className="status-dot" aria-hidden="true" />
      <span>{label}</span>
      {hint && <span className="status-hint">{hint}</span>}
    </div>
  );
}
