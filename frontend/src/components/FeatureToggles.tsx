import { t } from "../lib/i18n";

interface Props {
  emotionEnabled: boolean;
  drawingEnabled: boolean;
  librasEnabled: boolean;
  onToggleEmotion: () => void;
  onToggleDrawing: () => void;
  onToggleLibras: () => void;
  onClearDrawing: () => void;
  onClearText: () => void;
  onBackspace: () => void;
}

export function FeatureToggles({
  emotionEnabled,
  drawingEnabled,
  librasEnabled,
  onToggleEmotion,
  onToggleDrawing,
  onToggleLibras,
  onClearDrawing,
  onClearText,
  onBackspace,
}: Props) {
  return (
    <nav className="feature-toggles" aria-label="Feature controls">
      {(drawingEnabled || librasEnabled) && (
        <div className="feature-actions" role="toolbar" aria-label="Actions">
          {drawingEnabled && (
            <button
              className="feature-action"
              onClick={onClearDrawing}
              aria-label={t("feature.clear_drawing")}
            >
              {t("feature.clear_drawing")}
            </button>
          )}
          {librasEnabled && (
            <>
              <button
                className="feature-action"
                onClick={onBackspace}
                aria-label={t("feature.backspace")}
              >
                {t("feature.backspace")}
              </button>
              <button
                className="feature-action"
                onClick={onClearText}
                aria-label={t("feature.clear_text")}
              >
                {t("feature.clear_text")}
              </button>
            </>
          )}
        </div>
      )}
      <div className="feature-toggles-row" role="toolbar" aria-label="Feature toggles">
        <button
          className={`feature-toggle ${emotionEnabled ? "active" : ""}`}
          onClick={onToggleEmotion}
          aria-pressed={emotionEnabled}
          aria-label={t("feature.emotions")}
        >
          {t("feature.emotions")}
        </button>
        <button
          className={`feature-toggle ${drawingEnabled ? "active" : ""}`}
          onClick={onToggleDrawing}
          aria-pressed={drawingEnabled}
          aria-label={t("feature.drawing")}
        >
          {t("feature.drawing")}
        </button>
        <button
          className={`feature-toggle ${librasEnabled ? "active" : ""}`}
          onClick={onToggleLibras}
          aria-pressed={librasEnabled}
          aria-label={t("feature.libras")}
        >
          {t("feature.libras")}
        </button>
      </div>
    </nav>
  );
}
