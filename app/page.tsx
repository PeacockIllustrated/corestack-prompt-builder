"use client";
// Force redeploy

import React, { useState, useEffect } from "react";
import { generatePrompt, ProjectData } from "@/lib/buildPrompt";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TagInput } from "@/components/ui/TagInput";
import { ListInput } from "@/components/ui/ListInput";
import { FlowBuilder } from "@/components/ui/FlowBuilder";
import { EntityTree, EntityNode } from "@/components/ui/EntityTree";
import { EnvVarInput, EnvVar } from "@/components/ui/EnvVarInput";

export default function Home() {
  const [formData, setFormData] = useState<ProjectData>({
    projectName: "",
    projectSummary: "",
    entities: [],
    relationships: [],
    flows: [],
    notes: "",
    githubRepo: "",
    deploymentPlatform: "",
    backendStack: "",
    backendConfigCode: "",
    envVars: [],
  });

  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const [magicPrompt, setMagicPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setPrompt(generatePrompt(formData));
  }, [formData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (name: keyof ProjectData, value: string[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEntitiesChange = (nodes: EntityNode[]) => {
    setFormData((prev) => ({ ...prev, entities: nodes }));
  };

  const handleEnvVarsChange = (envVars: EnvVar[]) => {
    setFormData((prev) => ({ ...prev, envVars }));
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
        entities: [],
        relationships: [],
        flows: [],
        notes: "",
      });
    }
  };

  const handleMagicFill = async () => {
    if (!magicPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: magicPrompt }),
      });

      if (!res.ok) throw new Error("Failed to generate");

      const data = await res.json();

      setFormData(prev => ({
        ...prev,
        projectName: data.projectName || prev.projectName,
        projectSummary: data.projectSummary || prev.projectSummary,
        entities: data.entities || [],
        relationships: data.relationships || [],
        flows: data.flows || [],
      }));
    } catch (error) {
      console.error("Magic Fill Error:", error);
      alert("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="border-b border-green-800 pb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight uppercase text-glow">
            &gt; CoreStack Prompt Builder_
          </h1>
          <p className="text-green-700 mt-2 text-sm md:text-base font-mono">
            // Generate AI-ready bootstrap prompts for new admin dashboards
          </p>
        </header>

        {/* Magic Fill Section */}
        <section className="border border-green-800 bg-green-900/10 p-4 rounded-sm">
          <Label className="text-green-400 mb-2 block">AI Magic Fill</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Describe your app idea (e.g. 'A CRM for freelance photographers')..."
              value={magicPrompt}
              onChange={(e) => setMagicPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleMagicFill()}
              className="flex-1"
            />
            <Button
              onClick={handleMagicFill}
              disabled={isGenerating}
              className={isGenerating ? "animate-pulse" : ""}
            >
              {isGenerating ? "[ PROCESSING... ]" : "[ MAGIC_FILL ]"}
            </Button>
          </div>
        </section>

        {/* Deployment Configuration Section */}
        <section className="border border-green-800 bg-black/50 p-4">
          <h2 className="text-lg font-bold uppercase text-green-600 mb-4">Deployment & Configuration (Optional)</h2>
          <div className="space-y-6">
            <div>
              <Label htmlFor="githubRepo">GitHub Repository URL</Label>
              <Input
                id="githubRepo"
                name="githubRepo"
                placeholder="https://github.com/username/project"
                value={formData.githubRepo}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Deployment Platform</Label>
                <div className="flex gap-4 mt-2">
                  {["Vercel", "Netlify", "Other"].map((platform) => (
                    <button
                      key={platform}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, deploymentPlatform: platform }))}
                      className="flex items-center gap-2 cursor-pointer hover:text-green-400 transition-colors"
                    >
                      <span className="text-green-600 font-mono text-sm">
                        {formData.deploymentPlatform === platform ? "[ X ]" : "[   ]"}
                      </span>
                      <span className="text-sm font-mono">{platform}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Backend Stack</Label>
                <div className="flex gap-4 mt-2">
                  {["Firebase", "Supabase", "Both"].map((backend) => (
                    <button
                      key={backend}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, backendStack: backend }))}
                      className="flex items-center gap-2 cursor-pointer hover:text-green-400 transition-colors"
                    >
                      <span className="text-green-600 font-mono text-sm">
                        {formData.backendStack === backend ? "[ X ]" : "[   ]"}
                      </span>
                      <span className="text-sm font-mono">{backend}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {formData.backendStack && (
              <div>
                <Label htmlFor="backendConfigCode">
                  Backend Configuration Code (Optional)
                </Label>
                <p className="text-xs text-green-700 mb-2">
                  // Paste your Firebase/Supabase config object
                </p>
                <Textarea
                  id="backendConfigCode"
                  name="backendConfigCode"
                  placeholder={`const firebaseConfig = {\n  apiKey: "...",\n  authDomain: "...",\n  projectId: "..."\n};`}
                  value={formData.backendConfigCode}
                  onChange={handleChange}
                  rows={8}
                  className="font-mono text-xs"
                />
              </div>
            )}

            <EnvVarInput
              label="Environment Variables"
              value={formData.envVars || []}
              onChange={handleEnvVarsChange}
            />
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Input Form */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase text-green-600">
                [1] INPUT_BUFFER
              </h2>
              <Button variant="secondary" onClick={handleReset} className="text-xs py-1">
                [ RESET_FORM ]
              </Button>
            </div>

            <Card className="space-y-8 bg-black/80 backdrop-blur-sm">
              <div className="grid gap-6">
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

                <EntityTree
                  label="Domain Entities"
                  value={formData.entities}
                  onChange={handleEntitiesChange}
                />

                <ListInput
                  label="Key Relationships"
                  value={formData.relationships}
                  onChange={(val) => handleArrayChange("relationships", val)}
                  placeholder="e.g. One User has many Invoices"
                />

                <FlowBuilder
                  label="Core MVP Flows"
                  value={formData.flows}
                  onChange={(val) => handleArrayChange("flows", val)}
                />

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
              <h2 className="text-xl font-bold uppercase text-green-600">
                [2] OUTPUT_STREAM
              </h2>
              <Button onClick={handleCopy}>
                {copied ? "[ COPIED! ]" : "[ COPY_PROMPT ]"}
              </Button>
            </div>

            <Card className="relative min-h-[600px] max-h-[calc(100vh-12rem)] overflow-hidden flex flex-col bg-black/90">
              <div className="absolute top-0 left-0 right-0 h-8 bg-green-900/20 border-b border-green-800 flex items-center px-3 space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-700 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-green-700 animate-pulse delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-green-700 animate-pulse delay-150"></div>
                <span className="ml-auto text-xs text-green-800 font-mono">BUFFER_SIZE: {prompt.length}B</span>
              </div>
              <div className="mt-8 flex-1 overflow-auto custom-scrollbar p-4">
                <pre className="whitespace-pre-wrap text-sm text-green-400 font-mono leading-relaxed">
                  {prompt}
                </pre>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
