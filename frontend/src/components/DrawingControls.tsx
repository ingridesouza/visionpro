interface Props {
  drawingEnabled: boolean;
  onToggle: () => void;
  onClear: () => void;
}

export function DrawingControls({ drawingEnabled, onToggle, onClear }: Props) {
  return (
    <div className="drawing-controls">
      <button
        className={`drawing-toggle ${drawingEnabled ? "active" : ""}`}
        onClick={onToggle}
      >
        {drawingEnabled ? "Desativar Desenho" : "Ativar Desenho"}
      </button>
      <button className="drawing-clear" onClick={onClear}>
        Limpar Desenho
      </button>
    </div>
  );
}
