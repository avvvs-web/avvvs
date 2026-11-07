import type { CSSProperties } from 'react';

export type ThinkingOrbMode = 'orbits' | 'globe' | 'rubik' | 'wave' | 'web' | 'braid' | 'ribbon' | 'ring' | 'morph';

export type ThinkingOrbVariant =
  | 'working' | 'searching' | 'solving' | 'listening' | 'connecting'
  | 'weaving' | 'composing' | 'breathing' | 'shaping';

/** 'auto' follows prefers-color-scheme; 'light' draws dark ink, 'dark' draws light ink. */
export type ThinkingOrbSurface = 'auto' | 'light' | 'dark';

export interface ThinkingOrbDescriptor {
  id: string;
  name: string;
  variant: ThinkingOrbVariant;
  mode: ThinkingOrbMode;
  caption: string;
  frame: [number, number];
  summary: string;
}

export interface ThinkingOrbProps {
  variant?: ThinkingOrbVariant | ThinkingOrbMode;
  surface?: ThinkingOrbSurface;
  /** the drawn size in CSS pixels (square) */
  size?: number;
  /** animation speed multiplier */
  speed?: number;
  /** the orb's radius as a share of half the frame */
  scale?: number;
  playback?: 'play' | 'pause';
  /** overrides the surface ink, e.g. a brand colour */
  color?: string;
  /** show the caption under the orb */
  showCaption?: boolean;
  caption?: string;
  className?: string;
  style?: CSSProperties;
  'aria-label'?: string;
}

export interface BaseThinkingOrbProps extends Omit<ThinkingOrbProps, 'variant'> {
  mode: ThinkingOrbMode;
  caption: string;
  summary: string;
  frame: [number, number];
}

export type OrbProps = Omit<ThinkingOrbProps, 'variant'>;
