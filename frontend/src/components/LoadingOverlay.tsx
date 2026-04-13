import { t } from "../lib/i18n";

interface Props {
  message?: string;
}

export function LoadingOverlay({ message }: Props) {
  const text = message || t("loading.models");

  return (
    <div className="loading-overlay" role="status" aria-live="polite" aria-label={text}>
      <div className="loading-spinner" aria-hidden="true" />
      <p className="loading-text">{text}</p>
    </div>
  );
}
