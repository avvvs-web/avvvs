'use client';

import { BaseThinkingOrb } from './base-orb';
import type { OrbProps } from './types';

export function OrbWeaving(props: OrbProps) {
  return <BaseThinkingOrb mode="braid" caption="Weaving" summary="Three helical strands braiding around a ghosted sphere." frame={[240, 240]} {...props} />;
}
