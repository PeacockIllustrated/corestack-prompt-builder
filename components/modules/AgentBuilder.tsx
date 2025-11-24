import React from "react";
import { Label } from "../ui/Label";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { ListInput } from "../ui/ListInput";

export interface AgentData {
    agentName: string;
    agentPersona: string;
    triggers: string[];
    tools: string[];
    constraints: string[];
    outputFormat: string;
}

interface AgentBuilderProps {
    data: AgentData;
    onChange: (data: AgentData) => void;
}

export const AgentBuilder: React.FC<AgentBuilderProps> = ({ data, onChange }) => {
    const handleChange = (field: keyof AgentData, value: any) => {
        onChange({ ...data, [field]: value });
    };

    return (
        <div className="space-y-6">
            <div>
                <Label htmlFor="agentName">Agent Name</Label>
                <Input
                    id="agentName"
                    value={data.agentName}
                    onChange={(e) => handleChange("agentName", e.target.value)}
                    placeholder="e.g. CustomerSupportBot"
                />
            </div>

            <div>
                <Label htmlFor="agentPersona">Agent Persona</Label>
                <p className="text-xs text-green-700 mb-2">
          // Define the role, tone, and expertise
                </p>
                <Textarea
                    id="agentPersona"
                    value={data.agentPersona}
                    onChange={(e) => handleChange("agentPersona", e.target.value)}
                    placeholder="You are a senior support agent who is helpful, concise, and empathetic..."
                    rows={4}
                />
            </div>

            <div>
                <Label>Triggers</Label>
                <p className="text-xs text-green-700 mb-2">
          // What events start this agent?
                </p>
                <ListInput
                    label="Triggers"
                    value={data.triggers}
                    onChange={(items) => handleChange("triggers", items)}
                    placeholder="e.g. On new GitHub issue"
                />
            </div>

            <div>
                <Label>Tools & Capabilities</Label>
                <p className="text-xs text-green-700 mb-2">
          // What actions can it perform?
                </p>
                <ListInput
                    label="Tools"
                    value={data.tools}
                    onChange={(items) => handleChange("tools", items)}
                    placeholder="e.g. Web Search, Read File, Slack API"
                />
            </div>

            <div>
                <Label>Constraints & Safety</Label>
                <p className="text-xs text-green-700 mb-2">
          // Strict rules and boundaries
                </p>
                <ListInput
                    label="Constraints"
                    value={data.constraints}
                    onChange={(items) => handleChange("constraints", items)}
                    placeholder="e.g. Never delete files, Max 5 steps"
                />
            </div>

            <div>
                <Label htmlFor="outputFormat">Output Format / Schema</Label>
                <p className="text-xs text-green-700 mb-2">
          // Define the expected JSON/XML output
                </p>
                <Textarea
                    id="outputFormat"
                    value={data.outputFormat}
                    onChange={(e) => handleChange("outputFormat", e.target.value)}
                    placeholder={`{\n  "thought": "string",\n  "action": "string",\n  "params": {}\n}`}
                    rows={6}
                    className="font-mono text-xs"
                />
            </div>
        </div>
    );
};
