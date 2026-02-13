/**
 * Template Engine
 * 
 * Handles variable substitution using {{variable}} syntax.
 * Supports dot-notation for nested properties (e.g., {{user.name}}).
 */

import { get } from 'lodash';

const TEMPLATE_REGEX = /\{\{([^}]+)\}\}/g;

/**
 * Extracts all variable names from a template string
 */
export function extractVariables(template: string): string[] {
  const variables: string[] = [];
  let match: RegExpExecArray | null;
  
  // Reset regex lastIndex
  TEMPLATE_REGEX.lastIndex = 0;
  
  while ((match = TEMPLATE_REGEX.exec(template)) !== null) {
    variables.push(match[1].trim());
  }
  
  return [...new Set(variables)]; // Remove duplicates
}

/**
 * Renders a template string with variable substitution
 * 
 * @param template - The template string with {{variable}} placeholders
 * @param data - The data object to extract values from
 * @param options - Rendering options
 * @returns The rendered string with substitutions applied
 */
export function renderTemplate(
  template: string, 
  data: Record<string, unknown>,
  options: { missingValue?: string } = {}
): string {
  const { missingValue = '' } = options;
  
  return template.replace(TEMPLATE_REGEX, (match, path) => {
    const trimmedPath = path.trim();
    const value = get(data, trimmedPath);
    
    if (value === undefined || value === null) {
      return missingValue;
    }
    
    return String(value);
  });
}

/**
 * Recursively renders all string values in an object
 */
export function renderObjectTemplates<T>(
  obj: T,
  data: Record<string, unknown>,
  options: { missingValue?: string } = {}
): T {
  if (typeof obj === 'string') {
    return renderTemplate(obj, data, options) as unknown as T;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => renderObjectTemplates(item, data, options)) as unknown as T;
  }
  
  if (obj !== null && typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = renderObjectTemplates(value, data, options);
    }
    return result as T;
  }
  
  return obj;
}

/**
 * Checks if a string contains template variables
 */
export function hasTemplateVariables(str: string): boolean {
  TEMPLATE_REGEX.lastIndex = 0;
  return TEMPLATE_REGEX.test(str);
}