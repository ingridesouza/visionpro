import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeatureToggles } from "./FeatureToggles";

const defaultProps = {
  emotionEnabled: false,
  drawingEnabled: false,
  librasEnabled: false,
  onToggleEmotion: vi.fn(),
  onToggleDrawing: vi.fn(),
  onToggleLibras: vi.fn(),
  onClearDrawing: vi.fn(),
  onClearText: vi.fn(),
  onBackspace: vi.fn(),
};

describe("FeatureToggles", () => {
  it("renders all three toggle buttons", () => {
    render(<FeatureToggles {...defaultProps} />);
    expect(screen.getByText("Sentimentos")).toBeInTheDocument();
    expect(screen.getByText("Desenhar")).toBeInTheDocument();
    expect(screen.getByText("Libras")).toBeInTheDocument();
  });

  it("calls onToggleEmotion when clicked", () => {
    const fn = vi.fn();
    render(<FeatureToggles {...defaultProps} onToggleEmotion={fn} />);
    fireEvent.click(screen.getByText("Sentimentos"));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("shows action buttons when drawing enabled", () => {
    render(<FeatureToggles {...defaultProps} drawingEnabled={true} />);
    expect(screen.getByText("Limpar desenho")).toBeInTheDocument();
  });

  it("shows Libras actions when enabled", () => {
    render(<FeatureToggles {...defaultProps} librasEnabled={true} />);
    expect(screen.getByText("Apagar")).toBeInTheDocument();
    expect(screen.getByText("Limpar texto")).toBeInTheDocument();
  });

  it("has aria-pressed attributes", () => {
    render(<FeatureToggles {...defaultProps} emotionEnabled={true} />);
    expect(screen.getByText("Sentimentos")).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Desenhar")).toHaveAttribute("aria-pressed", "false");
  });
});
