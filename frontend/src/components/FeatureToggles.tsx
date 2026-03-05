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
    <div className="feature-toggles">
      {(drawingEnabled || librasEnabled) && (
        <div className="feature-actions">
          {drawingEnabled && (
            <button className="feature-action" onClick={onClearDrawing}>
              Limpar desenho
            </button>
          )}
          {librasEnabled && (
            <>
              <button className="feature-action" onClick={onBackspace}>
                Apagar
              </button>
              <button className="feature-action" onClick={onClearText}>
                Limpar texto
              </button>
            </>
          )}
        </div>
      )}
      <div className="feature-toggles-row">
        <button
          className={`feature-toggle ${emotionEnabled ? "active" : ""}`}
          onClick={onToggleEmotion}
        >
          Sentimentos
        </button>
        <button
          className={`feature-toggle ${drawingEnabled ? "active" : ""}`}
          onClick={onToggleDrawing}
        >
          Desenhar
        </button>
        <button
          className={`feature-toggle ${librasEnabled ? "active" : ""}`}
          onClick={onToggleLibras}
        >
          Libras
        </button>
      </div>
    </div>
  );
}
