describe('Polyglot Keyboard E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should have welcome screen', async () => {
    await expect(element(by.text('Polyglot Key'))).toBeVisible();
  });

  it('should navigate to translate tab', async () => {
    await element(by.text('Translate')).tap();
    await expect(element(by.text('Translation'))).toBeVisible();
  });

  it('should navigate to keyboard tab', async () => {
    await element(by.text('Keyboard')).tap();
    await expect(element(by.text('Keyboard Settings'))).toBeVisible();
  });

  it('should show translation input field', async () => {
    await element(by.text('Translate')).tap();
    await expect(element(by.id('translate-input'))).toBeVisible();
  });

  it('should navigate to settings tab', async () => {
    await element(by.text('Settings')).tap();
    await expect(element(by.text('Settings'))).toBeVisible();
  });

  it('should navigate to about tab', async () => {
    await element(by.text('About')).tap();
    await expect(element(by.text('About'))).toBeVisible();
  });

  // Keyboard-specific tests
  describe('Keyboard Integration', () => {
    it('should show keyboard installation instructions', async () => {
      await element(by.text('Keyboard')).tap();
      await expect(element(by.text('Setup Instructions'))).toBeVisible();
    });

    it('should provide keyboard activation guidance', async () => {
      await element(by.text('Keyboard')).tap();
      await expect(element(by.text('Enable in Settings'))).toBeVisible();
    });
  });

  // Translation tests
  describe('Translation Features', () => {
    it('should accept text input for translation', async () => {
      await element(by.text('Translate')).tap();
      await element(by.id('translate-input')).typeText('Hello world');
      await expect(element(by.id('translate-input'))).toHaveText('Hello world');
    });

    it('should show language selection options', async () => {
      await element(by.text('Translate')).tap();
      await expect(element(by.id('source-language-selector'))).toBeVisible();
      await expect(element(by.id('target-language-selector'))).toBeVisible();
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      await device.setURLBlacklist(['*']);
      await element(by.text('Translate')).tap();
      await element(by.id('translate-input')).typeText('Test text');
      await element(by.id('translate-button')).tap();
      await expect(element(by.text('Network error'))).toBeVisible();
      await device.setURLBlacklist([]);
    });
  });
});
