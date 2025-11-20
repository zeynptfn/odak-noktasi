export enum TimerMode {
  FOCUS = 'FOCUS',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK'
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  estimatedPomodoros: number;
  completedPomodoros: number;
  subtasks?: SubTask[];
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TimerConfig {
  [TimerMode.FOCUS]: number;
  [TimerMode.SHORT_BREAK]: number;
  [TimerMode.LONG_BREAK]: number;
}

export const DEFAULT_TIMES: TimerConfig = {
  [TimerMode.FOCUS]: 25 * 60,
  [TimerMode.SHORT_BREAK]: 5 * 60,
  [TimerMode.LONG_BREAK]: 15 * 60,
};