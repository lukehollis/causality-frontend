"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ExperimentState {
  inProgress: boolean;
  progress: number;
  currentStep: string;
  expId: string | null;
  error: string | null;
  currentChatId: string | null;
  currentMessageId: string | null;
}

interface ExperimentContextType {
  state: ExperimentState;
  startExperiment: (chatId: string, messageId: string) => void;
  updateProgress: (progress: number, step: string) => void;
  completeExperiment: () => void;
  abortExperiment: () => void;
}

const ExperimentContext = createContext<ExperimentContextType | undefined>(undefined);

export function ExperimentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ExperimentState>({
    inProgress: false,
    progress: 0,
    currentStep: "",
    expId: null,
    error: null,
    currentChatId: null,
    currentMessageId: null,
  });

  const startExperiment = useCallback((chatId: string, messageId: string) => {
    setState((prev) => ({
      ...prev,
      inProgress: true,
      progress: 0,
      currentStep: "Starting...",
      expId: `${Date.now()}`, // Simple ID; backend generates real one
      currentChatId: chatId,
      currentMessageId: messageId,
      error: null,
    }));
  }, []);

  const updateProgress = useCallback((progress: number, step: string) => {
    setState((prev) => ({ ...prev, progress, currentStep: step }));
  }, []);

  const completeExperiment = useCallback(() => {
    setState((prev) => ({ ...prev, inProgress: false, progress: 100 }));
  }, []);

  const abortExperiment = useCallback(() => {
    setState((prev) => ({ ...prev, inProgress: false, error: "Aborted" }));
  }, []);

  return (
    <ExperimentContext.Provider value={{ state, startExperiment, updateProgress, completeExperiment, abortExperiment }}>
      {children}
    </ExperimentContext.Provider>
  );
}

export function useExperiment() {
  const context = useContext(ExperimentContext);
  if (context === undefined) {
    throw new Error("useExperiment must be used within an ExperimentProvider");
  }
  return context;
}
