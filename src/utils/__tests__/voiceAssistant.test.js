import { voiceAssistant } from '../voiceAssistant';

describe('voiceAssistant utility', () => {
  test('voiceAssistant instance should expose startListening and stopListening methods', () => {
    expect(voiceAssistant).toBeDefined();
    expect(typeof voiceAssistant.stopListening).toBe('function');
  });

  test('startListening should return false and call onError if Web Speech API is missing', async () => {
    const onError = jest.fn();
    const result = await voiceAssistant.startListening(null, onError, null);

    expect(result).toBe(false);
    expect(onError).toHaveBeenCalledWith(
      expect.stringContaining('Web Speech API is not supported')
    );
  });
});
