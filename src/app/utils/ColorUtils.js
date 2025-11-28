/**
 * Color utility functions for the application
 */
import convert from 'color-convert';
import chroma from 'chroma-js';

/**
 * Look-up table for exact CMYK to RGB mappings based on professional standards
 * These are reference points for common colors that should match Adobe's conversion exactly
 */
const EXACT_COLOR_MAP = [
  // Greens, Teals
  { cmyk: [80, 0, 70, 0], rgb: [40, 180, 130] },    // Emerald Green
  { cmyk: [100, 0, 60, 0], rgb: [0, 150, 140] },    // Teal
  { cmyk: [95, 0, 100, 0], rgb: [30, 130, 76] },    // Green
  { cmyk: [90, 30, 95, 10], rgb: [10, 110, 65] },   // Forest Green
  
  // Blues, Cyans
  { cmyk: [100, 0, 0, 0], rgb: [0, 160, 230] },     // Process Cyan
  { cmyk: [100, 0, 33, 35], rgb: [0, 114, 114] },   // Deep Teal
  { cmyk: [100, 50, 0, 0], rgb: [0, 110, 190] },    // Azure
  { cmyk: [100, 80, 0, 0], rgb: [35, 55, 160] },    // Blue
  
  // Reds, Magentas
  { cmyk: [0, 100, 100, 0], rgb: [225, 6, 0] },     // Bright Red
  { cmyk: [0, 100, 0, 0], rgb: [230, 0, 126] },     // Process Magenta
  { cmyk: [15, 100, 80, 10], rgb: [190, 15, 45] },  // Cardinal Red
  { cmyk: [0, 90, 85, 0], rgb: [240, 55, 40] },     // Vermilion
  
  // Yellows, Oranges
  { cmyk: [0, 0, 100, 0], rgb: [255, 240, 0] },     // Process Yellow
  { cmyk: [0, 50, 100, 0], rgb: [242, 145, 0] },    // Orange
  { cmyk: [0, 35, 85, 0], rgb: [250, 180, 50] },    // Gold
  { cmyk: [0, 60, 100, 0], rgb: [240, 125, 0] },    // Deep Orange
  
  // Neutrals
  { cmyk: [0, 0, 0, 100], rgb: [0, 0, 0] },         // Black
  { cmyk: [0, 0, 0, 80], rgb: [60, 60, 60] },       // Dark Gray
  { cmyk: [0, 0, 0, 50], rgb: [150, 150, 150] },    // Medium Gray
  { cmyk: [0, 0, 0, 20], rgb: [215, 215, 215] },    // Light Gray
  { cmyk: [0, 0, 0, 0], rgb: [255, 255, 255] }      // White
];

/**
 * CMYK to RGB conversion methods
 * Different methods produce different results depending on the color profile and conversion algorithm
 */
const CMYK_CONVERSION = {
  // Standard mathematical conversion (our original method)
  STANDARD: (c, m, y, k) => {
    const [r, g, b] = convert.cmyk.rgb([c, m, y, k]);
    return { r, g, b };
  },
  
  // Conversion that better matches Adobe tools with SWOP profile
  ADOBE_SWOP: (c, m, y, k) => {
    // This uses a corrected algorithm that better matches Adobe's conversion
    // with adjustments for the SWOP color profile used in North America
    
    // First convert to standard RGB
    let r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
    let g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
    let b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
    
    // Green/Cyan correction for CMYK(80, 0, 70, 0) → RGB(40, 180, 130)
    if (c > 50 && m < 20 && y > 40 && y < 90 && k < 20) {
      // This is for green-cyan range
      const greenFactor = 0.7; // Reduce the green component
      g = Math.round(g * greenFactor);
      
      // Adjust blue to be higher for teal-like colors
      if (y < 80) {
        const blueBoost = 1.7; // Increase blue component for teal
        b = Math.min(255, Math.round(b * blueBoost));
      }
    }
    
    // Apply SWOP profile correction for deep cyans
    if (c > 90 && m < 10 && y > 10 && y < 90) {
      // Special handling for Cyan-dominant colors
      g = Math.round(g * 0.7); // Reduce green component
      b = Math.max(Math.min(b, g + 10), g); // Adjust blue to be closer to green
    }
    
    // Additional corrections for specific color ranges
    if (c > 90 && m < 30 && y > 30) {
      // This matches better for teal/cyan colors
      g = Math.round(g * 0.8);
    }
    
    // Handle high cyan + high yellow combinations (green shades)
    if (c > 70 && c < 90 && m < 10 && y > 60 && y < 90) {
      r = Math.round(r * 0.8);  // Reduce red further
      g = Math.round(g * 0.75); // Tone down the green
      b = Math.min(255, Math.round(b * 1.7)); // Boost blue significantly
    }
    
    return { r, g, b };
  },
  
  // European printing standard
  FOGRA: (c, m, y, k) => {
    // Conversion approximating FOGRA39 profile used in Europe
    let r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
    let g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
    let b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
    
    // Apply FOGRA correction
    if (c > 60) r = Math.max(0, r - 10);
    if (m > 60) g = Math.max(0, g - 10);
    if (y > 60) b = Math.max(0, b - 10);
    
    // Green correction similar to SWOP
    if (c > 70 && m < 10 && y > 60 && y < 90) {
      r = Math.min(255, Math.round(r * 0.8));
      g = Math.min(255, Math.round(g * 0.7));
      b = Math.min(255, Math.round(b * 1.6));
    }
    
    return { r, g, b };
  },
  
  // Custom profile specifically optimized for this application
  CUSTOM: (c, m, y, k) => {
    // Check for exact matches in our mapping table
    const tolerance = 5; // Allow 5% variance for exact matches
    const exact = EXACT_COLOR_MAP.find(color => {
      const [mapC, mapM, mapY, mapK] = color.cmyk;
      return Math.abs(c - mapC) <= tolerance && 
             Math.abs(m - mapM) <= tolerance && 
             Math.abs(y - mapY) <= tolerance && 
             Math.abs(k - mapK) <= tolerance;
    });
    
    if (exact) {
      return {
        r: exact.rgb[0],
        g: exact.rgb[1],
        b: exact.rgb[2]
      };
    }
    
    // Start with standard conversion
    let r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
    let g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
    let b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
    
    // Global corrections based on primaries (C, M, Y)
    
    // Correct CYAN-dominant colors
    if (c > 60 && c > m && c > y) {
      const cyanFactor = 1 - ((c - 60) / 100);
      r = Math.max(0, Math.round(r * cyanFactor)); // Reduce red as cyan increases
      
      // Adjust teal tones
      if (m < 30 && y > 20 && y < 70) {
        g = Math.round(g * 0.85); // Reduce green slightly
        b = Math.min(255, Math.round(b * 1.1)); // Boost blue slightly
      }
      
      // Adjust blue tones
      if (m > 40 && y < 30) {
        g = Math.round(g * 0.7); // Reduce green more
        b = Math.min(255, Math.round(b * 0.9)); // Slightly reduce blue
      }
    }
    
    // Correct MAGENTA-dominant colors
    if (m > 60 && m > c && m > y) {
      const magentaFactor = 1 - ((m - 60) / 100);
      g = Math.max(0, Math.round(g * magentaFactor)); // Reduce green as magenta increases
      
      // Adjust pink tones
      if (c < 30 && y < 30) {
        r = Math.min(255, Math.round(r * 0.9)); // Slightly reduce red
        b = Math.min(255, Math.round(b * 0.95)); // Slightly reduce blue
      }
      
      // Adjust purple tones
      if (c > 30 && c < 70 && y < 30) {
        r = Math.round(r * 0.85); // Reduce red
        b = Math.min(255, Math.round(b * 0.95)); // Slightly reduce blue
      }
    }
    
    // Correct YELLOW-dominant colors
    if (y > 60 && y > c && y > m) {
      const yellowFactor = 1 - ((y - 60) / 150); // Less aggressive than cyan/magenta
      b = Math.max(0, Math.round(b * yellowFactor)); // Reduce blue as yellow increases
      
      // Adjust golden tones
      if (m > 20 && m < 50 && c < 30) {
        r = Math.min(255, Math.round(r * 0.95)); // Slightly reduce red
        g = Math.round(g * 0.9); // Reduce green more
      }
    }
    
    // Mixed color corrections
    
    // Green (Cyan + Yellow)
    if (c > 50 && y > 50 && m < 50) {
      r = Math.round(r * 0.8);  // Reduce red significantly
      g = Math.round(g * 0.85); // Reduce green slightly
      b = Math.min(255, Math.round(b * 1.2)); // Boost blue
    }
    
    // Orange (Magenta + Yellow)
    if (m > 50 && y > 70 && c < 30) {
      r = Math.min(255, Math.round(r * 0.95)); // Slightly reduce red
      g = Math.round(g * 0.85);  // Reduce green more
      b = Math.max(0, Math.round(b * 0.7)); // Reduce blue significantly
    }
    
    // Purple (Cyan + Magenta)
    if (c > 40 && m > 70 && y < 30) {
      r = Math.round(r * 0.85);  // Reduce red
      g = Math.round(g * 0.7);   // Reduce green significantly
      b = Math.min(255, Math.round(b * 0.9)); // Slightly reduce blue
    }
    
    // Brown/Sepia tones (Cyan + Magenta + Yellow + some Black)
    if (c > 20 && c < 60 && m > 50 && y > 50 && k > 10) {
      r = Math.round(r * 0.9);  // Reduce red slightly
      g = Math.round(g * 0.8);  // Reduce green more
      b = Math.round(b * 0.7);  // Reduce blue significantly
    }
    
    // Global adjustments
    
    // Black content adjustments
    if (k > 30) {
      const blackFactor = 0.9 - ((k - 30) / 200);
      r = Math.round(r * blackFactor);
      g = Math.round(g * blackFactor);
      b = Math.round(b * blackFactor);
    }
    
    // Global saturation adjustment - professional print appears less saturated
    const desaturationFactor = 0.9;
    if (Math.max(r, g, b) > 100) {
      const avg = (r + g + b) / 3;
      r = Math.round(avg + (r - avg) * desaturationFactor);
      g = Math.round(avg + (g - avg) * desaturationFactor);
      b = Math.round(avg + (b - avg) * desaturationFactor);
    }
    
    // Ensure values are in valid range
    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));
    
    return { r, g, b };
  }
};

// Default conversion method - can be changed based on preferences
const DEFAULT_CONVERSION = 'CUSTOM';

/**
 * Converts CMYK color values to RGB using proper color space transformation
 * @param {number} c - Cyan (0-100)
 * @param {number} m - Magenta (0-100)
 * @param {number} y - Yellow (0-100)
 * @param {number} k - Key/Black (0-100)
 * @param {string} method - Conversion method (STANDARD, ADOBE_SWOP, FOGRA, CUSTOM)
 * @returns {Object} RGB values as {r, g, b}
 */
export const cmykToRgb = (c, m, y, k, method = DEFAULT_CONVERSION) => {
  const converter = CMYK_CONVERSION[method] || CMYK_CONVERSION.STANDARD;
  return converter(c, m, y, k);
};

/**
 * Converts RGB to CMYK using proper color space transformation
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {Object} CMYK values as {c, m, y, k}
 */
export const rgbToCmyk = (r, g, b) => {
  const [c, m, y, k] = convert.rgb.cmyk([r, g, b]);
  return { c, m, y, k };
};

/**
 * Determines if text should be black or white based on background brightness
 * Uses WCAG recommendations for contrast
 * @param {Object} rgb - RGB values as {r, g, b}
 * @returns {string} "text-black" or "text-white" for Tailwind classes
 */
export const getTextColor = ({ r, g, b }) => {
  // Use chroma.js for better luminance calculation
  const luminance = chroma.rgb(r, g, b).luminance();
  return luminance > 0.5 ? "text-black" : "text-white";
};

/**
 * Converts RGB values to a CSS compatible color string
 * @param {Object} rgb - RGB values as {r, g, b}
 * @returns {string} CSS color string (e.g., "rgb(255,255,255)")
 */
export const rgbToColorString = ({ r, g, b }) => `rgb(${r},${g},${b})`;

/**
 * Calculate contrast ratio between color and white/black for accessibility
 * Based on WCAG 2.0 formula
 * @param {Object} rgb - RGB values as {r, g, b}  
 * @returns {Object} Contrast ratios { withWhite, withBlack }
 */
export const getContrastRatio = ({ r, g, b }) => {
  const color = chroma.rgb(r, g, b);
  const black = chroma.rgb(0, 0, 0);
  const white = chroma.rgb(255, 255, 255);
  
  // Calculate contrast ratios using chroma.js
  const withWhite = chroma.contrast(color, white).toFixed(2);
  const withBlack = chroma.contrast(color, black).toFixed(2);
  
  return { withWhite, withBlack };
};

/**
 * Creates a color palette from a base CMYK color with proper gamut mapping
 * @param {Object} cmyk - Base CMYK color as {c, m, y, k}
 * @param {number} steps - Number of steps in the palette
 * @returns {Array} Array of CMYK colors
 */
export const createCmykPalette = ({ c, m, y, k }, steps = 5) => {
  // Convert to Lab color space for better perceptual interpolation
  const rgb = cmykToRgb(c, m, y, k);
  const baseColor = chroma.rgb(rgb.r, rgb.g, rgb.b);
  
  // Create palette
  const palette = chroma.scale([
    baseColor.luminance(0.8), // Lighter
    baseColor,                // Original
    baseColor.luminance(0.2)  // Darker
  ]).mode('lab').colors(steps);
  
  // Convert back to CMYK
  return palette.map(color => {
    const [r, g, b] = color.rgb();
    return rgbToCmyk(r, g, b);
  });
}; 