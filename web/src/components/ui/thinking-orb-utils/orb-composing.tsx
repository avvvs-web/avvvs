'use client';

import { BaseThinkingOrb } from './base-orb';
import type { OrbProps } from './types';

export function OrbComposing(props: OrbProps) {
  return <BaseThinkingOrb mode="ribbon" caption="Composing" summary="A rippling multi-lane ribbon wrapped over a sphere." frame={[240, 240]} {...props} />;
}
