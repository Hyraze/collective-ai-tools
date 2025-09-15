import { describe, it, expect } from 'vitest';
import { sanitizeHtml, escapeHtml, sanitizeUrl, validateTool } from '../security';

describe('Security Utils', () => {
  describe('sanitizeHtml', () => {
    it('removes script tags', () => {
      const malicious = '<script>alert("xss")</script><p>Safe content</p>';
      const result = sanitizeHtml(malicious);
      expect(result).toBe('<p>Safe content</p>');
    });

    it('removes iframe tags', () => {
      const malicious = '<iframe src="evil.com"></iframe><p>Safe content</p>';
      const result = sanitizeHtml(malicious);
      expect(result).toBe('<p>Safe content</p>');
    });

    it('removes event handlers', () => {
      const malicious = '<div onclick="alert(\'xss\')">Safe content</div>';
      const result = sanitizeHtml(malicious);
      expect(result).toBe('<div>Safe content</div>');
    });

    it('removes javascript: URLs', () => {
      const malicious = '<a href="javascript:alert(\'xss\')">Link</a>';
      const result = sanitizeHtml(malicious);
      // Should remove javascript: part, leaving only the content after it
      expect(result).not.toContain('javascript:');
      expect(result).toContain('<a href=');
      expect(result).toContain('Link</a>');
    });
  });

  describe('escapeHtml', () => {
    it('escapes HTML entities', () => {
      const input = '<script>alert("xss")</script>';
      const result = escapeHtml(input);
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('handles empty string', () => {
      const result = escapeHtml('');
      expect(result).toBe('');
    });
  });

  describe('sanitizeUrl', () => {
    it('allows valid HTTP URLs', () => {
      const url = 'https://example.com';
      const result = sanitizeUrl(url);
      expect(result).toBe('https://example.com/');
    });

    it('allows valid HTTP URLs', () => {
      const url = 'http://example.com';
      const result = sanitizeUrl(url);
      expect(result).toBe('http://example.com/');
    });

    it('blocks javascript: URLs', () => {
      const url = 'javascript:alert("xss")';
      const result = sanitizeUrl(url);
      expect(result).toBe('#');
    });

    it('blocks data: URLs', () => {
      const url = 'data:text/html,<script>alert("xss")</script>';
      const result = sanitizeUrl(url);
      expect(result).toBe('#');
    });

    it('blocks file: URLs', () => {
      const url = 'file:///etc/passwd';
      const result = sanitizeUrl(url);
      expect(result).toBe('#');
    });

    it('handles invalid URLs', () => {
      const url = 'not-a-url';
      const result = sanitizeUrl(url);
      expect(result).toBe('#');
    });
  });

  describe('validateTool', () => {
    it('validates correct tool structure', () => {
      const validTool = {
        name: 'Test Tool',
        url: 'https://example.com',
        description: 'A test tool',
        tags: ['#free']
      };
      expect(validateTool(validTool)).toBe(true);
    });

    it('rejects tool without required fields', () => {
      const invalidTool = {
        name: 'Test Tool',
        url: 'https://example.com'
        // missing description and tags
      };
      expect(validateTool(invalidTool)).toBe(false);
    });

    it('rejects tool with invalid URL', () => {
      const invalidTool = {
        name: 'Test Tool',
        url: 'not-a-url',
        description: 'A test tool',
        tags: ['#free']
      };
      expect(validateTool(invalidTool)).toBe(false);
    });

    it('rejects tool with empty name', () => {
      const invalidTool = {
        name: '',
        url: 'https://example.com',
        description: 'A test tool',
        tags: ['#free']
      };
      expect(validateTool(invalidTool)).toBe(false);
    });

    it('rejects non-object input', () => {
      expect(validateTool(null)).toBe(false);
      expect(validateTool(undefined)).toBe(false);
      expect(validateTool('string')).toBe(false);
      expect(validateTool(123)).toBe(false);
    });

    it('rejects tool with non-array tags', () => {
      const invalidTool = {
        name: 'Test Tool',
        url: 'https://example.com',
        description: 'A test tool',
        tags: 'not-an-array'
      };
      expect(validateTool(invalidTool)).toBe(false);
    });
  });
});
