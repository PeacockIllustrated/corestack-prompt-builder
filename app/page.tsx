"use client";
// Force redeploy

import React, { useState, useEffect } from "react";
import { generatePrompt, generateAgentPrompt, ProjectData } from "@/lib/buildPrompt";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListInput } from "@/components/ui/ListInput";
import { FlowBuilder } from "@/components/ui/FlowBuilder";
import { EntityTree, EntityNode } from "@/components/ui/EntityTree";
import { EnvVarInput, EnvVar } from "@/components/ui/EnvVarInput";
import { DesignSystemBuilder, DesignSystem } from "@/components/ui/DesignSystemBuilder";
import { ASCIIRadio } from "@/components/ui/ASCIIRadio";
import { AgentBuilder, AgentData } from "@/components/modules/AgentBuilder";

const STORAGE_KEY = "corestack_prompt_data";
const AGENT_STORAGE_KEY = "corestack_agent_data";

type ModuleType = "WEB_APP" | "AGENT";

export default function Home() {
  const [activeModule, setActiveModule] = useState<ModuleType>("WEB_APP");

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
    designSystem: {
      colorPalette: "monochrome",
      borderRadius: "square",
      spacing: "comfy",
      shadows: "flat",
      buttonStyle: "solid",
      cardStyle: "border",
      navigationStyle: "sticky",
      mobileFirst: true,
    },
  });

  const [agentData, setAgentData] = useState<AgentData>({
    agentName: "",
    agentPersona: "",
    triggers: [],
    tools: [],
    constraints: [],
    outputFormat: "",
  });

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed);
      } catch (e) {
        console.error("Failed to load saved data", e);
      }
    }

    const savedAgent = localStorage.getItem(AGENT_STORAGE_KEY);
    if (savedAgent) {
      try {
        const parsed = JSON.parse(savedAgent);
        setAgentData(parsed);
      } catch (e) {
        console.error("Failed to load saved agent data", e);
      }
    }
  }, []);

  // Save to localStorage on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(AGENT_STORAGE_KEY, JSON.stringify(agentData));
    }, 1000);
    return () => clearTimeout(timer);
  }, [agentData]);

  const [prompt, setPrompt] = useState("");
  const [copied, setCopied] = useState(false);

  const [magicPrompt, setMagicPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (activeModule === "WEB_APP") {
      setPrompt(generatePrompt(formData));
    } else {
      setPrompt(generateAgentPrompt(agentData));
    }
  }, [formData, agentData, activeModule]);

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

  const handleDesignSystemChange = (designSystem: DesignSystem) => {
    setFormData((prev) => ({ ...prev, designSystem }));
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

  const handleMagicFill = async () => {
    if (!magicPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: magicPrompt }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const data = await response.json();

      setFormData((prev) => ({
        ...prev,
        projectName: data.projectName || prev.projectName,
        projectSummary: data.projectSummary || prev.projectSummary,
        entities: data.entities || prev.entities,
        relationships: data.relationships || prev.relationships,
        flows: data.flows || prev.flows,
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

        {/* Module Selector */}
        <section className="flex gap-6 border-b border-green-900 pb-4">
          <button
            onClick={() => setActiveModule("WEB_APP")}
            className={`text-sm font-mono transition-colors ${activeModule === "WEB_APP" ? "text-green-400 font-bold" : "text-green-800 hover:text-green-600"
              }`}
          >
            {activeModule === "WEB_APP" ? "[ X ]" : "[   ]"} WEB_APP_BUILDER
          </button>
          <button
            onClick={() => setActiveModule("AGENT")}
            className={`text-sm font-mono transition-colors ${activeModule === "AGENT" ? "text-green-400 font-bold" : "text-green-800 hover:text-green-600"
              }`}
          >
            {activeModule === "AGENT" ? "[ X ]" : "[   ]"} AGENT_AUTOMATION
          </button>
        </section>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* LEFT COLUMN: Inputs */}
          <div className="space-y-8">

            {activeModule === "WEB_APP" ? (
              <>
                {/* [0] AI MAGIC FILL */}
                <section className="border border-green-800 bg-green-900/10 p-4 rounded-sm">
                  <Label className="text-green-400 mb-2 block font-bold">[0] AI MAGIC FILL</Label>
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

                {/* [1] PROJECT INFO */}
                <section className="space-y-6">
                  <h2 className="text-lg font-bold uppercase text-green-600 border-b border-green-800 pb-2">
                    [1] PROJECT INFO
                  </h2>

                  <div>
                    <Label htmlFor="projectName">Project Name</Label>
                    <Input
                      id="projectName"
                      name="projectName"
                      placeholder="e.g. photo-crm-v1"
                      value={formData.projectName}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="projectSummary">Summary</Label>
                    <Textarea
                      id="projectSummary"
                      name="projectSummary"
                      placeholder="Briefly describe the core value proposition..."
                      value={formData.projectSummary}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label>Entities (Data Model)</Label>
                    <p className="text-xs text-green-700 mb-2">
                      // Define your database schema hierarchy
                    </p>
                    <EntityTree
                      label="Entities (Data Model)"
                      value={formData.entities}
                      onChange={handleEntitiesChange}
                    />
                  </div>

                  <div>
                    <Label>Core Flows</Label>
                    <p className="text-xs text-green-700 mb-2">
                      // Define key user journeys (Step 1 -&gt; Step 2)
                    </p>
                    <FlowBuilder
                      label="Core Flows"
                      value={formData.flows}
                      onChange={(flows) => handleArrayChange("flows", flows)}
                    />
                  </div>

                  <div>
                    <Label>Relationships</Label>
                    <p className="text-xs text-green-700 mb-2">
                      // Define connections (e.g. "User has many Photos")
                    </p>
                    <ListInput
                      label="Relationships"
                      value={formData.relationships}
                      onChange={(items) => handleArrayChange("relationships", items)}
                      placeholder="e.g. User owns Projects"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Special Requirements / Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="Any specific tech constraints or business rules..."
                      value={formData.notes}
                      onChange={handleChange}
                      rows={4}
                    />
                  </div>
                </section>

                {/* [2] DEPLOYMENT & CONFIGURATION */}
                <section className="space-y-8">
                  <h2 className="text-lg font-bold uppercase text-green-600 border-b border-green-800 pb-2">
                    [2] DEPLOYMENT & CONFIGURATION
                  </h2>

                  {/* Design System Sub-section */}
                  <div className="border border-green-800 bg-black/50 p-4">
                    <Label className="text-green-500 mb-4 block border-b border-green-900 pb-1 w-max">
                      // DESIGN SYSTEM
                    </Label>
                    <DesignSystemBuilder
                      value={formData.designSystem!}
                      onChange={handleDesignSystemChange}
                    />
                  </div>

                  {/* Deployment Config Sub-section */}
                  <div className="border border-green-800 bg-black/50 p-4">
                    <Label className="text-green-500 mb-4 block border-b border-green-900 pb-1 w-max">
                      // DEPLOYMENT SETTINGS
                    </Label>
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
                          <div className="flex gap-4 mt-2 flex-wrap">
                            {["Vercel", "Netlify", "Other"].map((platform) => (
                              <ASCIIRadio
                                key={platform}
                                label={platform}
                                checked={formData.deploymentPlatform === platform}
                                onClick={() => setFormData(prev => ({ ...prev, deploymentPlatform: platform }))}
                              />
                            ))}
                          </div>
                        </div>

                        <div>
                          <Label>Backend Stack</Label>
                          <div className="flex gap-4 mt-2 flex-wrap">
                            {["Firebase", "Supabase", "Both"].map((backend) => (
                              <ASCIIRadio
                                key={backend}
                                label={backend}
                                checked={formData.backendStack === backend}
                                onClick={() => setFormData(prev => ({ ...prev, backendStack: backend }))}
                              />
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
                  </div>
                </section>
              </>
            ) : (
              <section className="space-y-6">
                <h2 className="text-lg font-bold uppercase text-green-600 border-b border-green-800 pb-2">
                  [1] AGENT CONFIGURATION
                </h2>
                <AgentBuilder
                  data={agentData}
                  onChange={setAgentData}
                />
              </section>
            )}
          </div>

          {/* RIGHT COLUMN: Output */}
          <div className="lg:sticky lg:top-8 h-fit space-y-4">
            <h2 className="text-lg font-bold uppercase text-green-600 border-b border-green-800 pb-2">
              [3] OUTPUT STREAM
            </h2>
            <Card className="p-0 overflow-hidden flex flex-col max-h-[calc(100vh-8rem)]">
              <div className="bg-green-900/20 p-2 border-b border-green-800 flex justify-between items-center">
                <span className="text-xs font-mono text-green-400 pl-2">
                  preview.md
                </span>
                <Button
                  onClick={handleCopy}
                  variant="secondary"
                  className="text-xs h-7"
                >
                  {copied ? "[ COPIED! ]" : "[ COPY_TO_CLIPBOARD ]"}
                </Button>
              </div>
              <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-black">
                <pre className="whitespace-pre-wrap font-mono text-sm text-green-500/90 leading-relaxed">
                  {prompt}
                </pre>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
