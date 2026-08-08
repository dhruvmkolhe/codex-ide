import { fileSchema, sharedCodeSchema, chatItemSchema } from '../schemas';

describe('schemas utility', () => {
  test('fileSchema should validate file object', () => {
    const validFile = { name: 'index.js', content: 'const a = 1;' };
    expect(fileSchema.safeParse(validFile).success).toBe(true);

    const invalidFile = { name: '', content: 123 };
    expect(fileSchema.safeParse(invalidFile).success).toBe(false);
  });

  test('sharedCodeSchema should validate shared URL payload', () => {
    const validPayload = {
      files: [{ name: 'app.js', content: 'console.log()' }],
      selectedLanguage: 'javascript',
    };
    expect(sharedCodeSchema.safeParse(validPayload).success).toBe(true);
  });

  test('chatItemSchema should validate role and content', () => {
    const validMsg = { role: 'user', content: 'Help me refactor' };
    expect(chatItemSchema.safeParse(validMsg).success).toBe(true);

    const invalidMsg = { role: 'superadmin', content: '' };
    expect(chatItemSchema.safeParse(invalidMsg).success).toBe(false);
  });
});
