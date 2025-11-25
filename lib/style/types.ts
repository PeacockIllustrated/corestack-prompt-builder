export type ColorTokens = {
  primary: string;
  primarySoft?: string;
  accent?: string;
  background: string;
  surface?: string;
  border?: string;
  text: string;
  mutedText?: string;
  success?: string;
  error?: string;
};

export type TypographyScale = {
  fontFamilyBase: string;
  fontFamilyHeading?: string;
  scale: {
    h1?: { size: string; weight: number; lineHeight: number | string };
    h2?: { size: string; weight: number; lineHeight: number | string };
    h3?: { size: string; weight: number; lineHeight: number | string };
    body: { size: string; weight: number; lineHeight: number | string };
    small?: { size: string; weight: number; lineHeight: number | string };
  };
};

export type RadiusTokens = {
  button?: string;
  card?: string;
  input?: string;
  chip?: string;
};

export type StyleComponent = {
  name: string;                // e.g. "Button"
  variants?: string[];         // e.g. ["primary", "secondary", "ghost"]
  description: string;         // e.g. "Rounded pill with bold lowercase label"
  usage?: string;              // e.g. "Use for primary CTAs"
};

export type StyleSystem = {
  colors: ColorTokens;
  typography: TypographyScale;
  spacingScale: number[];      // e.g. [4, 8, 12, 16, 24]
  radius?: RadiusTokens;
  shadows?: Record<string, string>; // e.g. { card: "0 8px 24px rgba(...)" }
  components: StyleComponent[];
  principles: string[];        // e.g. ["dark monochrome base with bright accent"]
};

export type RawStyleObservation = {
  rawColors: string[]; // hexes pulled from CSS or inferred
  rawFontFamilies: string[];
  rawFontSizes: number[];
  rawRadii: number[];
  rawSpacings: number[];
  notes: string[];     // freeform observations for the model
};
