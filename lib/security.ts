/**
 * Security utilities for sanitizing user content and preventing XSS attacks
 */

// Simple HTML sanitization - in production, use a library like DOMPurify
export function sanitizeHtml(html: string): string {
  // Remove potentially dangerous HTML tags and attributes
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/<link\b[^<]*>/gi, '')
    .replace(/<meta\b[^<]*>/gi, '')
    .replace(/\s*on\w+="[^"]*"/gi, '') // Remove event handlers with spaces
    .replace(/javascript:[^"'>]*/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, 'data-') // Sanitize data URLs
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

// Escape HTML entities
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML
    .replace(/"/g, '&quot;') // Ensure quotes are properly escaped
    .replace(/'/g, '&#39;'); // Escape single quotes
}

// Validate and sanitize URLs
export function sanitizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '#';
    }
    
    // Check for suspicious patterns
    const suspiciousPatterns = [
      /javascript:/i,
      /data:/i,
      /vbscript:/i,
      /file:/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(url))) {
      return '#';
    }
    
    return urlObj.toString();
  } catch {
    return '#';
  }
}

// Validate tool data structure
export function validateTool(tool: any): boolean {
  if (!tool || typeof tool !== 'object') return false;
  
  const requiredFields = ['name', 'url', 'description', 'tags'];
  if (!requiredFields.every(field => field in tool)) return false;
  
  // Validate field types
  if (typeof tool.name !== 'string' || tool.name.trim().length === 0) return false;
  if (typeof tool.url !== 'string' || tool.url.trim().length === 0) return false;
  if (typeof tool.description !== 'string' || tool.description.trim().length === 0) return false;
  if (!Array.isArray(tool.tags)) return false;
  
  // Validate URL
  try {
    new URL(tool.url);
  } catch {
    return false;
  }
  
  return true;
}

// Content Security Policy helper
export function getCSPDirectives(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://www.google-analytics.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');
}
