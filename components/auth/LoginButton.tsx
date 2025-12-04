"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TerminalButton } from "@/components/learning/TerminalButton";
import { TerminalInput } from "@/components/learning/TerminalInput";

export function LoginButton() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
            setSent(true);
        } catch (error) {
            console.error("Login failed:", error);
            alert("Failed to send magic link. Check console.");
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="text-center font-mono text-green-500 animate-pulse">
                <p className="mb-2">[ LINK_DISPATCHED ]</p>
                <p className="text-xs text-green-700">CHECK_COMMS_CHANNEL: {email}</p>
                <button
                    onClick={() => setSent(false)}
                    className="mt-4 text-[10px] text-green-800 hover:text-green-500 underline"
                >
                    RETRY_SEQUENCE
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
            <TerminalInput
                type="email"
                placeholder="OPERATOR_EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
            />
            <TerminalButton type="submit" isLoading={loading} disabled={loading || !email}>
                {loading ? "TRANSMITTING..." : "INIT_MAGIC_LINK"}
            </TerminalButton>
        </form>
    );
}
