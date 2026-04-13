import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConnectionStatus } from "./ConnectionStatus";

describe("ConnectionStatus", () => {
  it("renders connected state", () => {
    render(<ConnectionStatus status="connected" />);
    expect(screen.getByRole("status")).toHaveTextContent("Conectado");
  });

  it("renders connecting state", () => {
    render(<ConnectionStatus status="connecting" />);
    expect(screen.getByRole("status")).toHaveTextContent("Conectando...");
  });

  it("renders error state with hint", () => {
    render(<ConnectionStatus status="error" />);
    const el = screen.getByRole("status");
    expect(el).toHaveTextContent("Indisponivel");
    expect(el).toHaveTextContent("Backend offline");
  });

  it("has aria-live for screen readers", () => {
    render(<ConnectionStatus status="disconnected" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });
});
