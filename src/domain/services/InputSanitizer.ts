/**
 * Domain Service: InputSanitizer
 * Pure business logic for sanitizing and validating user inputs.
 * Zero external dependencies — framework agnostic.
 */

export class InputSanitizer {
  /**
   * Strip HTML tags and trim whitespace from a string.
   */
  static sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/<[^>]*>/g, '') // strip HTML
      .replace(/&[a-zA-Z]+;/g, '') // strip HTML entities
      .trim();
  }

  /**
   * Validate and sanitize an email address.
   */
  static sanitizeEmail(input: string): { valid: boolean; value: string; error?: string } {
    const cleaned = input.trim().toLowerCase();
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(cleaned)) {
      return { valid: false, value: cleaned, error: 'Please enter a valid email address.' };
    }
    return { valid: true, value: cleaned };
  }

  /**
   * Validate a URL (HTTP or HTTPS only).
   */
  static validateUrl(input: string): { valid: boolean; value: string; error?: string } {
    try {
      const url = new URL(input);
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return { valid: false, value: input, error: 'URL must use HTTP or HTTPS.' };
      }
      return { valid: true, value: input };
    } catch {
      return { valid: false, value: input, error: 'Please enter a valid URL.' };
    }
  }

  /**
   * Sanitize a slug: lowercase, alphanumeric and hyphens only.
   */
  static sanitizeSlug(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Truncate a text string to a maximum character count.
   */
  static truncate(input: string, maxLength: number = 150): string {
    if (!input) return '';
    if (input.length <= maxLength) return input;
    return `${input.slice(0, maxLength).trimEnd()}...`;
  }

  /**
   * Validate contact form fields: name, email, and message.
   * Returns a map of field errors (empty if all valid).
   */
  static validateContactForm(
    name: string,
    email: string,
    message: string
  ): Record<string, string> {
    const errors: Record<string, string> = {};

    const cleanName = InputSanitizer.sanitizeText(name);
    if (!cleanName || cleanName.length < 2) {
      errors.name = 'Name must be at least 2 characters long.';
    }

    const emailResult = InputSanitizer.sanitizeEmail(email);
    if (!emailResult.valid) {
      errors.email = emailResult.error || 'Invalid email.';
    }

    const cleanMessage = InputSanitizer.sanitizeText(message);
    if (!cleanMessage || cleanMessage.length < 10) {
      errors.message = 'Message must be at least 10 characters.';
    }
    if (cleanMessage.length > 3000) {
      errors.message = 'Message must be under 3000 characters.';
    }

    return errors;
  }

  /**
   * Sanitize an entire contact form payload.
   */
  static sanitizeContactPayload(payload: {
    sender_name: string;
    sender_email: string;
    subject?: string;
    message_text: string;
    country?: string;
    device?: string;
  }) {
    return {
      sender_name: InputSanitizer.sanitizeText(payload.sender_name).slice(0, 100),
      sender_email: InputSanitizer.sanitizeEmail(payload.sender_email).value,
      subject: payload.subject ? InputSanitizer.sanitizeText(payload.subject).slice(0, 200) : undefined,
      message_text: InputSanitizer.sanitizeText(payload.message_text).slice(0, 3000),
      country: payload.country ? InputSanitizer.sanitizeText(payload.country).slice(0, 60) : undefined,
      device: payload.device ? InputSanitizer.sanitizeText(payload.device).slice(0, 60) : undefined
    };
  }
}
