import { ProjectData } from "./buildPrompt";
import { AgentData } from "@/components/modules/AgentBuilder";

export type ProjectType = "WEB_APP" | "AGENT";

export interface ProjectMetadata {
    id: string;
    name: string;
    type: ProjectType;
    lastModified: number;
}

export interface SavedProject {
    metadata: ProjectMetadata;
    data: ProjectData | AgentData;
}

const STORAGE_KEY_PREFIX = "corestack_project_";
const INDEX_KEY = "corestack_project_index";

export const storage = {
    // Get all projects metadata for dashboard
    getAllProjects: (): ProjectMetadata[] => {
        if (typeof window === "undefined") return [];
        try {
            const index = localStorage.getItem(INDEX_KEY);
            const parsed = index ? JSON.parse(index) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Failed to load project index", e);
            return [];
        }
    },

    // Get specific project data
    getProject: (id: string): SavedProject | null => {
        if (typeof window === "undefined") return null;
        try {
            const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${id}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error(`Failed to load project ${id}`, e);
            return null;
        }
    },

    // Save project (updates index if new)
    saveProject: (id: string, data: ProjectData | AgentData, type: ProjectType, name: string) => {
        if (typeof window === "undefined") return;

        const timestamp = Date.now();
        const metadata: ProjectMetadata = { id, name, type, lastModified: timestamp };

        // Save full project data
        const savedProject: SavedProject = { metadata, data };
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${id}`, JSON.stringify(savedProject));

        // Update index
        const projects = storage.getAllProjects();
        const existingIndex = projects.findIndex((p) => p.id === id);

        if (existingIndex >= 0) {
            projects[existingIndex] = metadata;
        } else {
            projects.push(metadata);
        }

        localStorage.setItem(INDEX_KEY, JSON.stringify(projects));
    },

    // Create new project with defaults
    createProject: (type: ProjectType): string => {
        const id = crypto.randomUUID();
        let data: ProjectData | AgentData;

        if (type === "WEB_APP") {
            data = {
                projectName: "Untitled Project",
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
            } as ProjectData;
        } else {
            data = {
                agentName: "Untitled Agent",
                agentPersona: "",
                triggers: [],
                tools: [],
                constraints: [],
                outputFormat: "",
            } as AgentData;
        }

        storage.saveProject(id, data, type, type === "WEB_APP" ? "Untitled Project" : "Untitled Agent");
        return id;
    },

    // Delete project
    deleteProject: (id: string) => {
        if (typeof window === "undefined") return;

        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);

        const projects = storage.getAllProjects().filter((p) => p.id !== id);
        localStorage.setItem(INDEX_KEY, JSON.stringify(projects));
    }
};
