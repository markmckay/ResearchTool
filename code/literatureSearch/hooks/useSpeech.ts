"use client";
import { useState, useCallback } from "react";

export function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [currentKey, setCurrentKey] = useState<string | null>(null);

  const speak = useCallback((text: string, key = "default") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    utt.onstart = () => {
      setCurrentKey(key);
      setSpeaking(true);
    };
    utt.onend = () => {
      setCurrentKey(null);
      setSpeaking(false);
    };
    utt.onerror = () => {
      setCurrentKey(null);
      setSpeaking(false);
    };
    window.speechSynthesis.speak(utt);
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis.cancel();
    setCurrentKey(null);
    setSpeaking(false);
  }, []);

  const toggleSpeak = useCallback((text: string, key: string) => {
    if (speaking && currentKey === key) {
      stop();
      return;
    }
    speak(text, key);
  }, [currentKey, speak, speaking, stop]);

  const isSpeakingKey = useCallback((key: string) => speaking && currentKey === key, [currentKey, speaking]);

  return { speak, stop, speaking, currentKey, toggleSpeak, isSpeakingKey };
}
