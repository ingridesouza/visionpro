import { useRef, useState, useCallback } from "react";
import type { LibrasResult } from "../lib/librasClassifier";

const DEFAULT_STABILITY_FRAMES = 10; // ~333ms at 30 FPS
const DEFAULT_SPACE_TIMEOUT_FRAMES = 45; // ~1.5s at 30 FPS

interface Options {
  enabled: boolean;
  stabilityFrames?: number;
  spaceTimeoutFrames?: number;
}

export function useLibrasRecognition({
  enabled,
  stabilityFrames = DEFAULT_STABILITY_FRAMES,
  spaceTimeoutFrames = DEFAULT_SPACE_TIMEOUT_FRAMES,
}: Options) {
  const [currentLetter, setCurrentLetter] = useState<string | null>(null);
  const [currentConfidence, setCurrentConfidence] = useState(0);
  const [text, setText] = useState("");

  // Internal refs for rAF-speed updates (no re-renders)
  const candidateRef = useRef<string | null>(null);
  const candidateCountRef = useRef(0);
  const lastConfirmedRef = useRef<string | null>(null);
  const noLetterCountRef = useRef(0);
  const spaceInsertedRef = useRef(false);

  const feedResult = useCallback(
    (result: LibrasResult) => {
      if (!enabled) return;

      if (result.letter) {
        noLetterCountRef.current = 0;
        spaceInsertedRef.current = false;

        if (result.letter === candidateRef.current) {
          candidateCountRef.current++;
        } else {
          candidateRef.current = result.letter;
          candidateCountRef.current = 1;
        }

        // Update displayed letter immediately for responsiveness
        setCurrentLetter(result.letter);
        setCurrentConfidence(result.confidence);

        // Confirm after stability threshold
        if (candidateCountRef.current >= stabilityFrames) {
          if (result.letter !== lastConfirmedRef.current) {
            lastConfirmedRef.current = result.letter;
            setText((prev) => prev + result.letter);
          }
        }
      } else {
        candidateRef.current = null;
        candidateCountRef.current = 0;
        noLetterCountRef.current++;

        setCurrentLetter(null);
        setCurrentConfidence(0);

        // Insert space after pause
        if (
          noLetterCountRef.current >= spaceTimeoutFrames &&
          !spaceInsertedRef.current &&
          lastConfirmedRef.current !== null
        ) {
          spaceInsertedRef.current = true;
          lastConfirmedRef.current = null;
          setText((prev) => (prev.length > 0 && !prev.endsWith(" ") ? prev + " " : prev));
        }
      }
    },
    [enabled, stabilityFrames, spaceTimeoutFrames],
  );

  const clearText = useCallback(() => {
    setText("");
    candidateRef.current = null;
    candidateCountRef.current = 0;
    lastConfirmedRef.current = null;
    noLetterCountRef.current = 0;
    spaceInsertedRef.current = false;
    setCurrentLetter(null);
    setCurrentConfidence(0);
  }, []);

  const backspace = useCallback(() => {
    setText((prev) => prev.slice(0, -1));
    lastConfirmedRef.current = null;
  }, []);

  return {
    currentLetter,
    currentConfidence,
    text,
    feedResult,
    clearText,
    backspace,
  };
}
