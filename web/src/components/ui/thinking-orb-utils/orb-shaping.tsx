'use client';

import { BaseThinkingOrb } from './base-orb';
import type { OrbProps } from './types';

export function OrbShaping(props: OrbProps) {
  return <BaseThinkingOrb mode="morph" caption="Shaping" summary="A dotted outline morphing between circle, triangle and square." frame={[240, 240]} {...props} />;
}
