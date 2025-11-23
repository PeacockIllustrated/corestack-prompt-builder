"use client";

import React, { useState, useEffect } from "react";
import { generatePrompt, ProjectData } from "@/lib/buildPrompt";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Home() {
  const [formData, setFormData] = useState<ProjectData>({
    projectName: "",
    projectSummary: "",
    entities: "",
    relationships: "",
    flows: "",
    notes: "",
  });

  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPrompt(generatePrompt(formData));
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to clear all fields?")) {
      setFormData({
        projectName: "",
        projectSummary: "",
        entities: "",
        relationships: "",
        flows: "",
        notes: "",
      });
    }
  };

  return (
    <main className="min-h-screen bg-black text-green-500 p-4 md:p-8 font-mono selection:bg-green-900 selection:text-green-100">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="border-b border-green-800 pb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight uppercase">
            &gt; CoreStack Prompt Builder_
          </h1>
          <p className="text-green-700 mt-2 text-sm md:text-base">
            // Generate AI-ready bootstrap prompts for new admin dashboards
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input Form */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase text-green-600">
                [1] INPUT_BUFFER
              </h2>
              <Button variant="secondary" onClick={handleReset} className="text-xs py-1">
                [ RESET_FORM ]
              </Button>
            </div>

            <Card className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    name="projectName"
                    placeholder="e.g. Client Billing Dashboard"
                    value={formData.projectName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="projectSummary">One-line Summary</Label>
                  <Input
                    id="projectSummary"
                    name="projectSummary"
                    placeholder="e.g. Internal tool for managing invoices..."
                    value={formData.projectSummary}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <Label htmlFor="entities">Domain Entities</Label>
                  <Textarea
                    id="entities"
                    name="entities"
                    placeholder="- Clients&#10;- Invoices&#10;- Payments"
                    value={formData.entities}
                    onChange={handleChange}
                    className="h-32"
                  />
                </div>

                <div>
                  <Label htmlFor="relationships">Key Relationships</Label>
                  <Textarea
                    id="relationships"
                    name="relationships"
                    placeholder="- One Client has many Invoices..."
                    value={formData.relationships}
                    onChange={handleChange}
                    className="h-24"
                  />
                </div>

                <div>
                  <Label htmlFor="flows">Core MVP Flows</Label>
                  <Textarea
                    id="flows"
                    name="flows"
                    placeholder="- Admin logs in&#10;- Admin creates client..."
                    value={formData.flows}
                    onChange={handleChange}
                    className="h-32"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Special Requirements / Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="e.g. Mobile-friendly, Stripe integration later..."
                    value={formData.notes}
                    onChange={handleChange}
                    className="h-24"
                  />
                </div>
              </div>
            </Card>
          </section>

          {/* Right Column: Preview */}
          <section className="space-y-6 lg:sticky lg:top-8 h-fit">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase text-green-600">
                [2] OUTPUT_STREAM
              </h2>
              <Button onClick={handleCopy}>
                {copied ? "[ COPIED! ]" : "[ COPY_PROMPT ]"}
              </Button>
            </div>

            <Card className="relative min-h-[600px] max-h-[calc(100vh-12rem)] overflow-hidden flex flex-col">
              <div className="absolute top-0 left-0 right-0 h-6 bg-green-900/20 border-b border-green-800 flex items-center px-2 space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-700"></div>
                <div className="w-2 h-2 rounded-full bg-green-700"></div>
                <div className="w-2 h-2 rounded-full bg-green-700"></div>
              </div>
              <div className="mt-6 flex-1 overflow-auto custom-scrollbar">
                <pre className="whitespace-pre-wrap text-sm text-green-400 font-mono leading-relaxed p-2">
                  {prompt}
                </pre>
              </div>
              {/* Scanline effect overlay (optional, keeping it simple for now) */}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] opacity-20"></div>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
