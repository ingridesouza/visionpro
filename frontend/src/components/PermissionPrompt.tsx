interface Props {
  onAllow: () => void;
  error: string | null;
}

export function PermissionPrompt({ onAllow, error }: Props) {
  return (
    <div className="permission-prompt">
      <div className="permission-card">
        <div className="permission-icon">📷</div>
        <h2>VisionPro</h2>
        <p>Deteccao de emocoes em tempo real</p>
        <p className="permission-description">
          Este aplicativo precisa de acesso a sua camera para detectar suas
          expressoes faciais e identificar emocoes.
        </p>
        {error && <p className="permission-error">{error}</p>}
        <button className="permission-button" onClick={onAllow}>
          Permitir Camera
        </button>
      </div>
    </div>
  );
}
