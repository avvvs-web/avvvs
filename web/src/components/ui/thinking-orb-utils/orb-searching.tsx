'use client';

import { BaseThinkingOrb } from './base-orb';
import type { OrbProps } from './types';

export function OrbSearching(props: OrbProps) {
  return <BaseThinkingOrb mode="globe" caption="Searching" summary="A dotted globe swept by a rotating scan band." frame={[240, 240]} {...props} />;
}
