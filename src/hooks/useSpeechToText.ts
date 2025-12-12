"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// Types for browser SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onend: () => void;
  onerror: (event: any) => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

interface UseSpeechToTextOptions {
  language?: string;
  onFinal?: (text: string) => void;
}

export const useSpeechToText = ({
  language = "en-US",
  onFinal,
}: UseSpeechToTextOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [interimResult, setInterimResult] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isRestartingRef = useRef(false);

  // Use a ref for onFinal so we don't re-init the effect when the callback identity changes
  const onFinalRef = useRef(onFinal);

  useEffect(() => {
    onFinalRef.current = onFinal;
  }, [onFinal]);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let newInterim = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          if (onFinalRef.current) {
            onFinalRef.current(result[0].transcript);
          }
        } else {
          newInterim += result[0].transcript;
        }
      }

      setInterimResult(newInterim);
    };

    recognition.onend = () => {
      if (isRestartingRef.current) {
        isRestartingRef.current = false;
        try {
          recognition.start();
          setIsListening(true);
        } catch (e) {
          console.error("Failed to restart speech recognition", e);
          setIsListening(false);
        }
      } else {
        setIsListening(false);
        setInterimResult("");
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "aborted") {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language]); // onFinal is removed from dependencies

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      setInterimResult("");
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.stop();
  }, []);

  const resetSpeechContext = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;
    isRestartingRef.current = true;
    setInterimResult("");
    recognitionRef.current.abort();
  }, [isListening]);

  return {
    isListening,
    interimResult,
    startListening,
    stopListening,
    resetSpeechContext,
  };
};
