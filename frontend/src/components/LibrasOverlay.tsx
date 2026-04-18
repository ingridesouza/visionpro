import { t } from "../lib/i18n";

interface Props {
  currentLetter: string | null;
  confidence: number;
  text: string;
}

export function LibrasOverlay({ currentLetter, confidence, text }: Props) {
  const confPercent = Math.round(confidence * 100);

  return (
    <div
      className="libras-overlay"
      role="status"
      aria-live="polite"
      aria-label={
        currentLetter
          ? `Libras: ${currentLetter}, ${confPercent}%`
          : t("libras.waiting")
      }
    >
      {currentLetter ? (
        <>
          <span className="libras-letter" aria-hidden="true">{currentLetter}</span>
          <span className="libras-confidence" aria-hidden="true">
            {confPercent}%
          </span>
        </>
      ) : (
        <span className="libras-waiting">{t("libras.waiting")}</span>
      )}
      {text && (
        <>
          <span className="libras-separator" aria-hidden="true" />
          <span className="libras-text" aria-label={`Texto: ${text}`}>{text}</span>
        </>
      )}
    </div>
  );
}
