import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    name: 'polyglot-key-demo',
    version: '1.0.0',
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(),
  getStringAsync: jest.fn(() => Promise.resolve('')),
}));

// Mock React Navigation
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
    useRoute: () => ({
      params: {},
    }),
  };
});

// Translation services will be mocked in individual test files

// Basic React Native mocks
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    NativeModules: {
      ...RN.NativeModules,
      KeyboardBridge: {
        getSettings: jest.fn(() => Promise.resolve({})),
        updateSettings: jest.fn(() => Promise.resolve()),
        getTranslationHistory: jest.fn(() => Promise.resolve([])),
      },
    },
  };
});

// Global test utilities
global.__DEV__ = true;
