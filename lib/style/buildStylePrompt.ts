import type { StyleSystem } from "./types";

export type TargetPlatform = "lovable" | "vibe" | "cursor" | "generic";

export function buildStylePrompt(
    styleSystem: StyleSystem,
    targetPlatform: TargetPlatform
): string {
    const { colors, typography, spacingScale, radius, components, principles } = styleSystem;

    const platformNotes =
        targetPlatform === "lovable"
            ? "Reuse existing components. Do not invent new colours. Use Tailwind classes derived from the configured theme. Avoid inline styles."
            : targetPlatform === "vibe"
                ? "Keep classNames consistent. Prefer composition of existing components over duplicating styles."
                : targetPlatform === "cursor"
                    ? "Generate idiomatic React/TSX with clean Tailwind classes. Avoid magic numbers; respect the spacing scale."
                    : "Respect the design system. Do not invent new tokens.";

    // Build a human-readable style guide string
    // Keep structure stable so prompts are predictable.
    return [
        "Use the following design system for all UI in this project.",
        "",
        "COLORS:",
        `- primary: ${colors.primary}`,
        colors.primarySoft ? `- primarySoft: ${colors.primarySoft}` : "",
        colors.accent ? `- accent: ${colors.accent}` : "",
        `- background: ${colors.background}`,
        colors.surface ? `- surface: ${colors.surface}` : "",
        colors.border ? `- border: ${colors.border}` : "",
        `- text: ${colors.text}`,
        colors.mutedText ? `- mutedText: ${colors.mutedText}` : "",
        colors.success ? `- success: ${colors.success}` : "",
        colors.error ? `- error: ${colors.error}` : "",
        "",
        "TYPOGRAPHY:",
        `- base font: ${typography.fontFamilyBase}`,
        typography.fontFamilyHeading
            ? `- heading font: ${typography.fontFamilyHeading}`
            : "",
        `- body: ${typography.scale.body.size}, weight ${typography.scale.body.weight}, line-height ${typography.scale.body.lineHeight}`,
        typography.scale.h1
            ? `- h1: ${typography.scale.h1?.size}, weight ${typography.scale.h1?.weight}, line-height ${typography.scale.h1?.lineHeight}`
            : "",
        typography.scale.h2
            ? `- h2: ${typography.scale.h2?.size}, weight ${typography.scale.h2?.weight}, line-height ${typography.scale.h2?.lineHeight}`
            : "",
        "",
        "SPACING SCALE (px):",
        spacingScale.join(", "),
        "",
        radius
            ? [
                "RADII:",
                radius.button ? `- button: ${radius.button}` : "",
                radius.card ? `- card: ${radius.card}` : "",
                radius.input ? `- input: ${radius.input}` : "",
                radius.chip ? `- chip: ${radius.chip}` : "",
                ""
            ].join("\n")
            : "",
        "COMPONENTS:",
        ...components.map((c) => {
            const v = c.variants && c.variants.length ? ` (variants: ${c.variants.join(", ")})` : "";
            const usage = c.usage ? ` Usage: ${c.usage}` : "";
            return `- ${c.name}${v}: ${c.description}.${usage}`;
        }),
        "",
        "STYLE PRINCIPLES:",
        ...principles.map((p) => `- ${p}`),
        "",
        "GUIDELINES:",
        "- Never invent new colours; only use the tokens defined above.",
        "- Reuse existing components instead of recreating similar ones.",
        "- Use the spacing scale values; avoid arbitrary pixel values.",
        "- Maintain visual consistency between screens (same card and button treatments).",
        `- ${platformNotes}`
    ]
        .filter(Boolean)
        .join("\n");
}
