// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

// jsdom can't play audio; the notification bell only needs a play() that resolves.
class SilentAudio {
  volume = 1;
  play() {
    return Promise.resolve();
  }
}

const FOCUS_SECONDS = 25 * 60;

// Advance one second at a time so React re-renders between ticks, as in the browser.
const tick = async (seconds: number) => {
  for (let i = 0; i < seconds; i++) {
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
  }
};

const addTask = (title: string) => {
  const input = screen.getByPlaceholderText('Ne üzerinde çalışacaksın?');
  fireEvent.change(input, { target: { value: title } });
  fireEvent.submit(input.closest('form')!);
};

const completedCount = () => screen.getByText(/tamamlandı$/).textContent;
const taskPomodoros = () => screen.getByText(/Pomodoro$/).textContent;
const timerText = () => screen.getByText(/^\d\d:\d\d$/).textContent;

describe('Pomodoro timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('Audio', SilentAudio);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('counts a finished focus session once', async () => {
    render(<App />);
    addTask('Bitirme raporu');

    fireEvent.click(screen.getByRole('button', { name: 'BAŞLAT' }));
    await tick(FOCUS_SECONDS);

    expect(completedCount()).toBe('1 tamamlandı');
    expect(taskPomodoros()).toBe('1 / 1 Pomodoro');
  });

  it('starts the next session from the full duration instead of counting it again', async () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'BAŞLAT' }));
    await tick(FOCUS_SECONDS);

    fireEvent.click(screen.getByRole('button', { name: 'BAŞLAT' }));
    await tick(3);

    expect(timerText()).toBe('24:57');
    expect(completedCount()).toBe('1 tamamlandı');
  });
});
