/**
 * Security utilities for sanitizing user content and preventing XSS attacks
 */

import DOMPurify from 'isomorphic-dompurify';

// HTML sanitization using DOMPurify
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class']
  });
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
interface Tool {
  name: string;
  url: string;
  description: string;
  tags: string[];
  [key: string]: unknown;
}

// Validate tool data structure
export function validateTool(tool: unknown): tool is Tool {
  if (!tool || typeof tool !== 'object') return false;
  
  const requiredFields = ['name', 'url', 'description', 'tags'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = tool as any;

  if (!requiredFields.every(field => field in t)) return false;
  
  // Validate field types
  if (typeof t.name !== 'string' || t.name.trim().length === 0) return false;
  if (typeof t.url !== 'string' || t.url.trim().length === 0) return false;
  if (typeof t.description !== 'string' || t.description.trim().length === 0) return false;
  if (!Array.isArray(t.tags)) return false;
  
  // Validate URL
  try {
    new URL(t.url);
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
