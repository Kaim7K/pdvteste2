"use client";

import { useEffect, useRef } from "react";

export function useBarcodeCapture(onCode: (code: string) => void) {
  const buffer = useRef("");
  const last = useRef(0);

  useEffect(() => {
    function handler(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTypingField = target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (isTypingField) return;

      const now = Date.now();
      if (now - last.current > 80) buffer.current = "";
      last.current = now;

      if (event.key === "Enter") {
        const code = buffer.current.trim();
        buffer.current = "";
        if (code.length >= 3) onCode(code);
        return;
      }

      if (event.key.length === 1) {
        buffer.current += event.key;
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCode]);
}
