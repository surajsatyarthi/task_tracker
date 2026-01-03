import { describe, it, expect, vi, beforeEach } from 'vitest';

// Error handling utilities
const handleApiError = (error: any): string => {
  if (error?.message) return error.message;
  if (typeof error === 'string') return error;
  return 'An unexpected error occurred';
};

const validateTaskInput = (title: string, description?: string): { valid: boolean; error?: string } => {
  if (!title || !title.trim()) {
    return { valid: false, error: 'Title is required' };
  }
  if (title.length > 500) {
    return { valid: false, error: 'Title must be 500 characters or less' };
  }
  if (description && description.length > 5000) {
    return { valid: false, error: 'Description must be 5000 characters or less' };
  }
  return { valid: true };
};

const isValidURL = (url: string): boolean => {
  try {
    const urlToTest = url.match(/^https?:\/\//i) ? url : `https://${url}`;
    new URL(urlToTest);
    return true;
  } catch {
    return false;
  }
};

describe('Error Handling', () => {
  describe('API Error Handling', () => {
    it('extracts error message from Error object', () => {
      const error = new Error('Network connection failed');
      const result = handleApiError(error);
      expect(result).toBe('Network connection failed');
    });

    it('handles string error messages', () => {
      const error = 'Failed to fetch data';
      const result = handleApiError(error);
      expect(result).toBe('Failed to fetch data');
    });

    it('returns generic message for unknown error types', () => {
      const error = { code: 500 };
      const result = handleApiError(error);
      expect(result).toBe('An unexpected error occurred');
    });

    it('handles null error', () => {
      const result = handleApiError(null);
      expect(result).toBe('An unexpected error occurred');
    });

    it('handles undefined error', () => {
      const result = handleApiError(undefined);
      expect(result).toBe('An unexpected error occurred');
    });
  });

  describe('Task Input Validation', () => {
    it('validates valid task input', () => {
      const result = validateTaskInput('Valid Task', 'Valid description');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects empty title', () => {
      const result = validateTaskInput('');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title is required');
    });

    it('rejects whitespace-only title', () => {
      const result = validateTaskInput('   ');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title is required');
    });

    it('rejects title over 500 characters', () => {
      const longTitle = 'A'.repeat(501);
      const result = validateTaskInput(longTitle);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Title must be 500 characters or less');
    });

    it('accepts title at 500 characters limit', () => {
      const maxTitle = 'A'.repeat(500);
      const result = validateTaskInput(maxTitle);
      expect(result.valid).toBe(true);
    });

    it('rejects description over 5000 characters', () => {
      const longDesc = 'A'.repeat(5001);
      const result = validateTaskInput('Valid Title', longDesc);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Description must be 5000 characters or less');
    });

    it('accepts description at 5000 characters limit', () => {
      const maxDesc = 'A'.repeat(5000);
      const result = validateTaskInput('Valid Title', maxDesc);
      expect(result.valid).toBe(true);
    });

    it('accepts task without description', () => {
      const result = validateTaskInput('Valid Title');
      expect(result.valid).toBe(true);
    });
  });

  describe('URL Validation', () => {
    it('validates standard HTTPS URLs', () => {
      expect(isValidURL('https://example.com')).toBe(true);
      expect(isValidURL('https://www.example.com')).toBe(true);
      expect(isValidURL('https://example.com/path')).toBe(true);
    });

    it('validates HTTP URLs', () => {
      expect(isValidURL('http://example.com')).toBe(true);
    });

    it('validates URLs without protocol', () => {
      expect(isValidURL('example.com')).toBe(true);
      expect(isValidURL('www.example.com')).toBe(true);
    });

    it('rejects invalid URLs', () => {
      expect(isValidURL('not a url')).toBe(false);
      expect(isValidURL('ht tp://broken.com')).toBe(false);
      expect(isValidURL('')).toBe(false);
    });

    it('validates URLs with query parameters', () => {
      expect(isValidURL('https://example.com?param=value')).toBe(true);
    });

    it('validates URLs with ports', () => {
      expect(isValidURL('https://example.com:8080')).toBe(true);
    });

    it('validates localhost URLs', () => {
      expect(isValidURL('http://localhost:3000')).toBe(true);
    });
  });

  describe('Network Error Scenarios', () => {
    it('handles fetch network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network request failed'));
      
      try {
        await fetch('/api/tasks');
      } catch (error) {
        const message = handleApiError(error);
        expect(message).toBe('Network request failed');
      }
    });

    it('handles 404 responses', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      });

      const response = await fetch('/api/tasks/999');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });

    it('handles 500 server errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      const response = await fetch('/api/tasks');
      expect(response.ok).toBe(false);
      expect(response.status).toBe(500);
    });
  });

  describe('Data Validation Edge Cases', () => {
    it('handles null task title', () => {
      const result = validateTaskInput(null as any);
      expect(result.valid).toBe(false);
    });

    it('handles undefined task title', () => {
      const result = validateTaskInput(undefined as any);
      expect(result.valid).toBe(false);
    });

    it('trims whitespace before validation', () => {
      const result = validateTaskInput('  Valid Title  ');
      expect(result.valid).toBe(true);
    });

    it('handles special characters in title', () => {
      const result = validateTaskInput('Task #1: Fix bug @ login!');
      expect(result.valid).toBe(true);
    });

    it('handles unicode characters in title', () => {
      const result = validateTaskInput('タスク 任务 🚀');
      expect(result.valid).toBe(true);
    });
  });
});
