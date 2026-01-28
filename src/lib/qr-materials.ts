/**
 * QR Materials - Different design variants for QR codes
 * 
 * Requirements 6.1, 6.2, 6.3, 6.4
 */

// --- NEW PRODUCT-FIRST TYPES ---

export type MaterialType = "table-tent" | "sticker" | "card" | "poster";

export interface QrDesignState {
  materialType: MaterialType;
  baseColor: string; // Hex color
  accentColor: string; // Hex color
  ctaText: string;
  showLogo: boolean;
  logoUrl?: string; // For future use
  customText?: string; // Additional text line
}

export const MATERIAL_TYPES: { id: MaterialType; label: { ru: string; en: string }; description: { ru: string; en: string } }[] = [
  {
    id: "table-tent",
    label: { ru: "Тейбл-тент", en: "Table Tent" },
    description: { ru: "Домик на стол (А4)", en: "Table stand (A4)" }
  },
  {
    id: "sticker",
    label: { ru: "Наклейка", en: "Sticker" },
    description: { ru: "Для стола или двери", en: "For table or door" }
  },
  {
    id: "card",
    label: { ru: "Визитка", en: "Business Card" },
    description: { ru: "Вкладыш в счет", en: "Bill insert" }
  },
  {
    id: "poster",
    label: { ru: "Плакат", en: "Poster" },
    description: { ru: "А4/А3 на стену", en: "Wall poster" }
  }
];

export const DEFAULT_CTA_TEXTS = [
  "Оставьте чаевые",
  "Поблагодарите нас",
  "Вам понравилось?",
  "Scan to tip",
];

// --- LEGACY TYPES (Kept for API compatibility) ---

export type QrOrientation = "horizontal" | "vertical";
export type QrBackgroundColor = "white" | "black" | "green" | "gradient";
export type QrCallToAction = "leave_tip" | "scan_to_tip" | "thank_us";
export type QrFormat = "png" | "pdf";

export interface QrMaterial {
  id: string;
  orientation: QrOrientation;
  backgroundColor: QrBackgroundColor;
  callToAction: QrCallToAction;
  label: string;
  ctaText: string;
}

// Call to action texts
const CTA_TEXTS: Record<QrCallToAction, { ru: string; en: string }> = {
  leave_tip: { ru: "Оставьте чаевые", en: "Leave a tip" },
  scan_to_tip: { ru: "Scan to tip", en: "Scan to tip" },
  thank_us: { ru: "Поблагодарите нас", en: "Thank us" },
};

// Background color labels
const BG_LABELS: Record<QrBackgroundColor, { ru: string; en: string }> = {
  white: { ru: "Белый фон", en: "White background" },
  black: { ru: "Чёрный фон", en: "Black background" },
  green: { ru: "Зелёный фон", en: "Green background" },
  gradient: { ru: "Градиент", en: "Gradient" },
};

// Orientation labels
const ORIENTATION_LABELS: Record<QrOrientation, { ru: string; en: string }> = {
  horizontal: { ru: "Горизонтальный", en: "Horizontal" },
  vertical: { ru: "Вертикальный", en: "Vertical" },
};

/**
 * All available QR material variants
 */
export const QR_MATERIALS: QrMaterial[] = [
  // Horizontal variants
  {
    id: "h-white-leave",
    orientation: "horizontal",
    backgroundColor: "white",
    callToAction: "leave_tip",
    label: "Горизонтальный · Белый",
    ctaText: "Оставьте чаевые",
  },
  {
    id: "h-black-scan",
    orientation: "horizontal",
    backgroundColor: "black",
    callToAction: "scan_to_tip",
    label: "Горизонтальный · Чёрный",
    ctaText: "Scan to tip",
  },
  {
    id: "h-gradient-thank",
    orientation: "horizontal",
    backgroundColor: "gradient",
    callToAction: "thank_us",
    label: "Горизонтальный · Градиент",
    ctaText: "Поблагодарите нас",
  },
  // Vertical variants
  {
    id: "v-white-leave",
    orientation: "vertical",
    backgroundColor: "white",
    callToAction: "leave_tip",
    label: "Вертикальный · Белый",
    ctaText: "Оставьте чаевые",
  },
  {
    id: "v-green-scan",
    orientation: "vertical",
    backgroundColor: "green",
    callToAction: "scan_to_tip",
    label: "Вертикальный · Зелёный",
    ctaText: "Scan to tip",
  },
  {
    id: "v-gradient-thank",
    orientation: "vertical",
    backgroundColor: "gradient",
    callToAction: "thank_us",
    label: "Вертикальный · Градиент",
    ctaText: "Поблагодарите нас",
  },
];

/**
 * Get material by ID
 */
export function getMaterialById(id: string): QrMaterial | undefined {
  return QR_MATERIALS.find(m => m.id === id);
}

/**
 * Get materials by orientation
 */
export function getMaterialsByOrientation(orientation: QrOrientation): QrMaterial[] {
  return QR_MATERIALS.filter(m => m.orientation === orientation);
}

/**
 * Get CSS styles for background color
 */
export function getBackgroundStyles(backgroundColor: QrBackgroundColor): {
  background: string;
  textColor: string;
  qrColor: string;
} {
  switch (backgroundColor) {
    case "white":
      return {
        background: "#FFFFFF",
        textColor: "#1F2937",
        qrColor: "#000000",
      };
    case "black":
      return {
        background: "#1F2937",
        textColor: "#FFFFFF",
        qrColor: "#FFFFFF",
      };
    case "green":
      return {
        background: "#059669",
        textColor: "#FFFFFF",
        qrColor: "#FFFFFF",
      };
    case "gradient":
      return {
        background: "linear-gradient(135deg, #0EA5E9 0%, #6366F1 100%)",
        textColor: "#FFFFFF",
        qrColor: "#FFFFFF",
      };
  }
}

/**
 * Get dimensions for orientation
 */
export function getDimensions(orientation: QrOrientation): {
  width: number;
  height: number;
  qrSize: number;
} {
  if (orientation === "horizontal") {
    return { width: 400, height: 200, qrSize: 150 };
  }
  return { width: 200, height: 350, qrSize: 150 };
}

/**
 * Get CTA text in specified language
 */
export function getCtaText(cta: QrCallToAction, lang: "ru" | "en" = "ru"): string {
  return CTA_TEXTS[cta][lang];
}

/**
 * Get background label in specified language
 */
export function getBackgroundLabel(bg: QrBackgroundColor, lang: "ru" | "en" = "ru"): string {
  return BG_LABELS[bg][lang];
}

/**
 * Get orientation label in specified language
 */
export function getOrientationLabel(orientation: QrOrientation, lang: "ru" | "en" = "ru"): string {
  return ORIENTATION_LABELS[orientation][lang];
}
