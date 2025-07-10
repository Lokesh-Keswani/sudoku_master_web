// Jest setup file
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock speechSynthesis
const speechSynthesisMock = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn().mockReturnValue([]),
};

Object.defineProperty(window, 'speechSynthesis', {
  value: speechSynthesisMock,
  writable: true
});

// Mock AudioContext
class AudioContextMock {
  createOscillator = jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
  });
  createGain = jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: { value: 0 },
  });
  destination = {};
}

// @ts-ignore
global.AudioContext = AudioContextMock; 