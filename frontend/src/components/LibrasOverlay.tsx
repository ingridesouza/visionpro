interface Props {
  currentLetter: string | null;
  confidence: number;
  text: string;
}

export function LibrasOverlay({ currentLetter, confidence, text }: Props) {
  return (
    <div className="libras-overlay">
      {currentLetter ? (
        <>
          <span className="libras-letter">{currentLetter}</span>
          <span className="libras-confidence">
            {Math.round(confidence * 100)}%
          </span>
        </>
      ) : (
        <span className="libras-waiting">Mostre uma letra...</span>
      )}
      {text && <div className="libras-text">{text}</div>}
    </div>
  );
}
