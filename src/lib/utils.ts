import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validatePromptContent(content: string): ValidationResult {
  const errors: string[] = [];
  
  // Check for unmatched brackets
  const stack: number[] = [];
  
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{' && content[i + 1] === '{') {
      stack.push(i);
      i++; // Skip the next bracket
    } else if (content[i] === '}' && content[i + 1] === '}') {
      if (stack.length === 0) {
        errors.push(`Closing brackets '}}' found without matching opening brackets at position ${i}`);
      } else {
        stack.pop();
      }
      i++; // Skip the next bracket
    }
  }
  
  if (stack.length > 0) {
    errors.push(`Unclosed variable brackets starting at position ${stack[0]}`);
  }
  
  // Check for empty variables
  const variables = content.match(/\{\{([^}]*)\}\}/g) || [];
  variables.forEach(variable => {
    const trimmed = variable.slice(2, -2).trim();
    if (!trimmed) {
      errors.push('Empty variable brackets found: {{}}');
    }
    if (/\s{2,}/.test(trimmed)) {
      errors.push(`Variable "${trimmed}" contains multiple spaces`);
    }
    if (/[^a-zA-Z0-9_\s]/.test(trimmed)) {
      errors.push(`Variable "${trimmed}" contains invalid characters. Use only letters, numbers, and underscores`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

const iconColors = [
  { light: '#3b9eff', dark: '#60a5fa' }, // Blue
  { light: '#ff801f', dark: '#f97316' }, // Orange
  { light: '#33b074', dark: '#22c55e' }, // Green
];

export function getNextIconColor(): { light: string; dark: string } {
  const currentIndex = parseInt(localStorage.getItem('iconColorIndex') || '0');
  const nextIndex = (currentIndex + 1) % iconColors.length;
  localStorage.setItem('iconColorIndex', nextIndex.toString());
  return iconColors[currentIndex];
}

const hoverColorSchemes = [
  { bg: '#0d2847', text: '#3b9eff' }, // Blue
  { bg: '#331e0b', text: '#ff801f' }, // Orange
  { bg: '#132d21', text: '#33b074' }, // Green
];

let currentSchemeIndex = 0;

export function getRandomHoverScheme(): { bg: string; text: string } {
  const index = currentSchemeIndex;
  currentSchemeIndex = (currentSchemeIndex + 1) % hoverColorSchemes.length;
  return hoverColorSchemes[index];
}

const variableColors = [
  ['bg-blue-100', 'text-blue-800', 'dark:bg-blue-900/50', 'dark:text-blue-300'],
  ['bg-orange-100', 'text-orange-800', 'dark:bg-orange-900/50', 'dark:text-orange-300'],
  ['bg-emerald-100', 'text-emerald-800', 'dark:bg-emerald-900/50', 'dark:text-emerald-300'],
];

export function getVariableHighlightClass(index: number | undefined): string {
  if (typeof index !== 'number' || index < 0) {
    return variableColors[0].join(' ');
  }
  const colorSet = variableColors[index % variableColors.length];
  return colorSet.join(' ');
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}