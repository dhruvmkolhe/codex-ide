import { sessionRecovery } from '../sessionRecovery';
import { voiceAssistant } from '../voiceAssistant';

describe('Workspace Session Auto-Recovery & Voice Assistant', () => {
  afterEach(() => {
    sessionRecovery.clearSession();
  });

  test('should save and restore workspace session state', () => {
    const mockState = {
      activeFileIndex: 1,
      openFileNames: ['index.js', 'main.py'],
      selectedLanguage: 'python',
      workspaceMode: 'beta',
    };

    sessionRecovery.saveSession(mockState);
    const restored = sessionRecovery.restoreSession();

    expect(restored).not.toBeNull();
    expect(restored.activeFileIndex).toBe(1);
    expect(restored.openFileNames).toEqual(['index.js', 'main.py']);
    expect(restored.selectedLanguage).toBe('python');
  });

  test('should clear saved session state', () => {
    sessionRecovery.saveSession({ activeFileIndex: 0 });
    sessionRecovery.clearSession();
    const restored = sessionRecovery.restoreSession();
    expect(restored).toBeNull();
  });

  test('should verify voice assistant initial status', () => {
    expect(typeof voiceAssistant.isSupported).toBe('boolean');
    expect(voiceAssistant.isListening).toBe(false);
  });
});
