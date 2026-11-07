'use client';

import { BaseThinkingOrb } from './base-orb';
import type { OrbProps } from './types';

export function OrbWorking(props: OrbProps) {
  return <BaseThinkingOrb mode="orbits" caption="Working" summary="Particles tracing tilted orbital rings around a ghosted sphere." frame={[240, 240]} {...props} />;
}
