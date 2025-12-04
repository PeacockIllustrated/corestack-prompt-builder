"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TerminalButton } from "@/components/learning/TerminalButton";

export function LoginButton() {
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const handleLogin = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error) {
            console.error("Login failed:", error);
            setLoading(false);
        }
    };

    return (
        <TerminalButton onClick={handleLogin} isLoading={loading}>
            INIT_AUTH_SEQUENCE
        </TerminalButton>
    );
}
