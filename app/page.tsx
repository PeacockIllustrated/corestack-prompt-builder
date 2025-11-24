"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        router.push("/dashboard");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

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
          v1.0.2 // SYSTEM_READY
        </div>

        <div className="mt-12">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-green-400 font-bold font-mono text-lg md:text-xl hover:text-green-300 transition-colors animate-pulse"
          >
            [ PRESS ENTER TO START ]{showCursor ? "_" : " "}
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 text-green-900 text-[10px] font-mono">
        © 2024 CORESTACK SYSTEMS // ALL RIGHTS RESERVED
      </div>
    </main>
  );
}
