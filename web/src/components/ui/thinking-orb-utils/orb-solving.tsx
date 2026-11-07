'use client';

import { BaseThinkingOrb } from './base-orb';
import type { OrbProps } from './types';

export function OrbSolving(props: OrbProps) {
  return <BaseThinkingOrb mode="rubik" caption="Solving" summary="A point-cloud sphere permuted by successive quarter-turn slice rotations." frame={[240, 240]} {...props} />;
}
