export interface GaugeReading {
  title: string;
  unit: string;
  value: string;
  num: number;
  pos: number;
  color: string;
  aqi: boolean;
  ok: boolean;
}
export type Mood = "happy" | "neutral" | "angry";
export interface StoryFrame {
  y: number;
  els: HTMLElement[];
  part: number;
  scene?: HTMLElement;
  anchor?: HTMLElement;
  scenePart?: number;
}
export interface StoryChange {
  els: HTMLElement[];
  moving: boolean;
}
export interface StoryController {
  frames(): StoryFrame[];
  go(direction: number, advance?: boolean): boolean;
  current(): StoryFrame | null;
  /** True when go(1) would move: a later stop, or another product in the selected product rail. Never moves anything. */
  hasNext(): boolean;
}
export interface StoryMotion {
  target: StoryFrame;
  y: number;
  from: number;
  distance: number;
  duration: number;
  k: number;
  start: number;
  direction: number;
}
export interface StoryTouch {
  id: number;
  x: number;
  y: number;
  target: Element;
  vertical: boolean;
  used: boolean;
}
