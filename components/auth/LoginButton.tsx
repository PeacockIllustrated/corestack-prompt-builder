"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TerminalButton } from "@/components/learning/TerminalButton";
import { TerminalInput } from "@/components/learning/TerminalInput";

export function LoginButton() {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const supabase = createClient();
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        setErrorMsg(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;

            // Successful login will be caught by the auth listener in page.tsx
            // but we can also push manually for faster feedback
            router.push("/dashboard");
        } catch (error: any) {
            console.error("Login failed:", error);
            setErrorMsg(error.message || "ACCESS_DENIED");
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
            {errorMsg && (
                <div className="text-red-500 font-mono text-xs text-center border border-red-900 bg-red-900/10 p-2">
                    ERROR: {errorMsg}
                </div>
            )}

            <TerminalInput
                type="email"
                placeholder="OPERATOR_EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
            />

            <TerminalInput
                type="password"
                placeholder="ACCESS_CODE"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
            />

            <TerminalButton type="submit" isLoading={loading} disabled={loading || !email || !password}>
                {loading ? "AUTHENTICATING..." : "INIT_SEQUENCE"}
            </TerminalButton>
        </form>
    );
}
