/**
 * Use Case: SendMessage
 * Handles the submission of a contact form message.
 * Applies input sanitization before persisting via MessageRepository port.
 */

import type { Message } from '../../domain/entities';
import type { MessageRepository } from '../ports';
import { InputSanitizer } from '../../domain/services';

export class SendMessageUseCase {
  private repo: MessageRepository;
  constructor(repo: MessageRepository) {
    this.repo = repo;
  }

  async execute(payload: {
    sender_name: string;
    sender_email: string;
    subject?: string;
    message_text: string;
    country?: string;
    device?: string;
  }): Promise<Message> {
    // Validate using domain service
    const errors = InputSanitizer.validateContactForm(
      payload.sender_name,
      payload.sender_email,
      payload.message_text
    );

    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      throw new Error(firstError);
    }

    // Sanitize before persisting
    const sanitized = InputSanitizer.sanitizeContactPayload(payload);
    return this.repo.create(sanitized);
  }
}

export class GetAllMessagesUseCase {
  private repo: MessageRepository;
  constructor(repo: MessageRepository) {
    this.repo = repo;
  }

  async execute(): Promise<Message[]> {
    return this.repo.getAll();
  }
}

export class MarkMessageReadUseCase {
  private repo: MessageRepository;
  constructor(repo: MessageRepository) {
    this.repo = repo;
  }

  async execute(id: string): Promise<void> {
    await this.repo.updateStatus(id, 'read');
  }
}

export class DeleteMessageUseCase {
  private repo: MessageRepository;
  constructor(repo: MessageRepository) {
    this.repo = repo;
  }

  async execute(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
