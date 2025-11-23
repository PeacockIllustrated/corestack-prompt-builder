export interface ProjectData {
  projectName: string;
  projectSummary: string;
  entities: string[];
  relationships: string[];
  flows: string[];
  notes: string;
}

export function generatePrompt(data: ProjectData): string {
  const {
    projectName,
    projectSummary,
    entities,
    relationships,
    flows,
    notes,
  } = data;

  // Helper to handle empty fields
  const formatSection = (content: string | string[]) => {
    if (Array.isArray(content)) {
      if (content.length === 0) return "(none)";
      return content.map((item) => `- ${item}`).join("\n");
    }
    return content.trim() ? content.trim() : "(none)";
  };

  return `You are an expert full-stack TypeScript engineer helping me bootstrap a new admin dashboard using my standard CoreStack architecture.

## Project Overview
- Name: ${projectName || "[PROJECT_NAME]"}
- Summary: ${projectSummary || "[PROJECT_SUMMARY]"}

## Tech Stack (fixed)
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Postgres + Auth)
- Vercel (deployment)
- GitHub (repo)

## Domain Entities
${formatSection(entities)}

## Key Relationships
${formatSection(relationships)}

## Core MVP Flows
${formatSection(flows)}

## Special Requirements / Notes
${formatSection(notes)}

---

# Your Task

1. Scaffold a reusable admin dashboard shell:
   - Public routes under \`app/\` (/, /auth/login)
   - Authenticated area under \`app/app/*\`
   - Protected layout with sidebar + topbar
2. Use Supabase Auth with email/password for login.
3. Use Tailwind for all styling, with clean, minimal UI.
4. Keep dependencies minimal and mainstream (no extra UI libraries).
5. Do **not** build CRUD pages yet – only the shell and auth.

# Output Format
1. Propose the folder/file structure.
2. Provide \`package.json\`, Tailwind config, PostCSS config, tsconfig, next.config.
3. Provide full code for:
   - \`app/layout.tsx\`
   - \`app/page.tsx\`
   - \`app/auth/login/page.tsx\`
   - \`app/app/layout.tsx\`
   - \`app/app/page.tsx\`
   - Supabase client/server helpers in \`lib/\`.
4. Briefly explain how everything fits together.
`;
}
