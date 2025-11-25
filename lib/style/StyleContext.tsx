"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import type { StyleSystem } from "./types";

type StyleContextValue = {
    activeStyleSystem: StyleSystem | null;
    stylePrompt: string | null;
    setStyle: (system: StyleSystem | null, prompt: string | null) => void;
};

const StyleContext = createContext<StyleContextValue | undefined>(undefined);

export const StyleProvider = ({ children }: { children: ReactNode }) => {
    const [activeStyleSystem, setActiveStyleSystem] = useState<StyleSystem | null>(null);
    const [stylePrompt, setStylePrompt] = useState<string | null>(null);

    const setStyle = (system: StyleSystem | null, prompt: string | null) => {
        setActiveStyleSystem(system);
        setStylePrompt(prompt);
    };

    return (
        <StyleContext.Provider value={{ activeStyleSystem, stylePrompt, setStyle }}>
            {children}
        </StyleContext.Provider>
    );
};

export const useStyleContext = () => {
    const ctx = useContext(StyleContext);
    if (!ctx) throw new Error("useStyleContext must be used within StyleProvider");
    return ctx;
};
