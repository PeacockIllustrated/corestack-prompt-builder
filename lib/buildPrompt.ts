import { EntityNode } from "@/components/ui/EntityTree";
import { EnvVar } from "@/components/ui/EnvVarInput";

export interface ProjectData {
  projectName: string;
  projectSummary: string;
  entities: EntityNode[];
  relationships: string[];
  flows: string[];
  notes: string;
  githubRepo?: string;
  deploymentPlatform?: string;
  backendStack?: string;
  envVars?: EnvVar[];
}

const formatEntityTree = (nodes: EntityNode[], depth = 0): string => {
  if (nodes.length === 0) return "";

  return nodes.map(node => {
    const indent = "  ".repeat(depth);
    const children = formatEntityTree(node.children, depth + 1);
    return `${indent}- ${node.name}\n${children}`;
  }).join("");
};

const formatEnvVarsTable = (envVars: Array<{ key: string; value: string }>): string => {
  if (envVars.length === 0) return "";

  const header = "| Key                    | Value                     |\n|------------------------|---------------------------|";
  const rows = envVars.map(({ key, value }) => {
    const paddedKey = key.padEnd(22);
    const paddedValue = value.padEnd(25);
    return `| ${paddedKey} | ${paddedValue} |`;
  }).join("\n");

  return `${header}\n${rows}`;
};

const getDeploymentInstructions = (platform?: string): string => {
  if (!platform) return "";

  switch (platform.toLowerCase()) {
    case "vercel":
      return `1. Connect the GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy from main branch`;
    case "netlify":
      return `1. Link GitHub repository to Netlify
2. Add environment variables in Netlify UI
3. Deploy from main branch`;
    default:
      return `1. Set up CI/CD pipeline for your platform
2. Configure environment variables
3. Deploy from main branch`;
  }
};

export function generatePrompt(data: ProjectData): string {
  const formatSection = (content: string | string[] | EntityNode[]) => {
    if (Array.isArray(content)) {
      if (content.length === 0) return "(none)";

      // Check if it's an array of EntityNodes (by checking first item properties)
      const firstItem = content[0];
      if (typeof firstItem === 'object' && firstItem !== null && 'children' in firstItem) {
        return formatEntityTree(content as EntityNode[]).trim();
      }

      return (content as string[]).map((item) => `- ${item}`).join("\n");
    }
    return (content as string).trim() ? (content as string).trim() : "(none)";
  };

  const deploymentSection = data.githubRepo ? `

## Deployment Configuration

Target Repository: ${data.githubRepo}
${data.deploymentPlatform ? `Deployment Platform: ${data.deploymentPlatform}` : ""}

${data.backendStack ? `Backend Stack: ${data.backendStack}` : ""}

${data.envVars && data.envVars.length > 0 ? `Environment Variables:
${formatEnvVarsTable(data.envVars)}

⚠️ Note: Secret keys should be added to .env.local after deployment
` : ""}
${data.deploymentPlatform ? `Setup Instructions:
${getDeploymentInstructions(data.deploymentPlatform)}` : ""}
` : "";

  return `# CoreStack Bootstrap Prompt

Project Name: ${data.projectName || "(untitled)"}
Summary: ${data.projectSummary || "(no summary)"}
${deploymentSection}
## Tech Stack (Non-Negotiable)
- Next.js 15 (App Router, TypeScript, Tailwind)
- ${data.backendStack || "Firebase + Supabase + Clerk"}

## Domain Entities
${formatSection(data.entities)}

## Key Relationships
${formatSection(data.relationships)}

## Core MVP Flows
${formatSection(data.flows)}

## Special Requirements / Notes
${formatSection(data.notes)}
`;
}
