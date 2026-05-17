import { describe, expect, it } from 'vitest';

import type { FileMetaData } from '@/types/documents';

import { ALLOWED_TYPES, MAX_FILE_SIZE, validateDocument } from './document-validation';

function makeFileMetaData(overrides: Partial<FileMetaData> = {}): FileMetaData {
  return {
    mimeType: ALLOWED_TYPES[0],
    size: MAX_FILE_SIZE - 1,
    ...overrides,
  };
}

describe('validateDocument', () => {
  describe('invalid mimeType', () => {
    it('returns the correct error', () => {
      expect(validateDocument(makeFileMetaData({ mimeType: 'text/plain' }))).toStrictEqual({
        valid: false,
        error: 'The file type is not allowed',
      });
    });
  });

  describe('valid mimeType', () => {
    it.each(ALLOWED_TYPES)('returns valid when mimeType is %s', (mimeType) => {
      expect(validateDocument(makeFileMetaData({ mimeType }))).toStrictEqual({ valid: true });
    });
  });

  describe('invalid size', () => {
    it('returns the correct error', () => {
      expect(validateDocument(makeFileMetaData({ size: MAX_FILE_SIZE + 1 }))).toStrictEqual({
        valid: false,
        error: 'The file size is too large',
      });
    });
  });

  describe('valid size', () => {
    it.each([MAX_FILE_SIZE, MAX_FILE_SIZE - 1, 0])('returns valid when size is %i', (size) => {
      expect(validateDocument(makeFileMetaData({ size }))).toStrictEqual({ valid: true });
    });
  });
});
