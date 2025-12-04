"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { LoginButton } from "@/components/auth/LoginButton";
import { TerminalButton } from "@/components/learning/TerminalButton";

export default function WelcomePage() {
  const router = useRouter();
  const [showCursor, setShowCursor] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null);
        setLoading(false);
        if (session?.user) {
          router.push("/dashboard");
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4 select-none cursor-default">
      <div className="text-green-500 font-mono text-xs md:text-sm leading-tight whitespace-pre text-center opacity-80 mb-8">
        {`
   ______                   _____ __             __  
  / ____/___  ________     / ___// /_____ ______/ /__
 / /   / __ \\/ ___/ _ \\    \\__ \\/ __/ __ \`/ ___/ //_/
/ /___/ /_/ / /  /  __/   ___/ / /_/ /_/ / /__/ ,<   
\\____/\\____/_/   \\___/   /____/\\__/\\__,_/\\___/_/|_|  
                                                     
    P  R  O  M  P  T     B  U  I  L  D  E  R      
`}
      </div>

      <div className="space-y-4 text-center">
        <div className="text-green-800 text-xs font-mono">
          v1.0.2 {"//"} SYSTEM_READY
        </div>

        <div className="mt-12 min-h-[60px]">
          {loading ? (
            <div className="text-green-900 animate-pulse font-mono">[ CHECKING_ACCESS_LEVEL... ]</div>
          ) : user ? (
            <div className="space-y-4">
              <div className="text-green-600 font-mono text-xs">
                WELCOME_BACK: {user.email}
              </div>
              <TerminalButton
                onClick={() => router.push("/dashboard")}
                className="animate-pulse"
              >
                ENTER_SYSTEM
              </TerminalButton>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-green-900 font-mono text-xs mb-4">
                AUTH_REQUIRED {"//"} PLEASE_IDENTIFY
              </div>
              <LoginButton />
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-8 text-green-900 text-[10px] font-mono">
        © 2024 CORESTACK SYSTEMS {"//"} ALL RIGHTS RESERVED
      </div>
    </main>
  );
}
