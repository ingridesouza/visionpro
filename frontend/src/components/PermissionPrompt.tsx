import { t } from "../lib/i18n";

interface Props {
  onAllow: () => void;
  error: string | null;
}

export function PermissionPrompt({ onAllow, error }: Props) {
  return (
    <div className="permission-prompt" role="dialog" aria-labelledby="perm-title" aria-describedby="perm-desc">
      <div className="permission-card">
        <div className="permission-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent)" }}>
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 id="perm-title">{t("app.title")}</h2>
        <p>{t("app.subtitle")}</p>
        <p className="permission-description" id="perm-desc">
          {t("permission.description")}
        </p>
        {error && (
          <p className="permission-error" role="alert" aria-live="assertive">
            {error}
          </p>
        )}
        <button
          className="permission-button"
          onClick={onAllow}
          autoFocus
          aria-label={t("permission.button")}
        >
          {t("permission.button")}
        </button>
      </div>
    </div>
  );
}
