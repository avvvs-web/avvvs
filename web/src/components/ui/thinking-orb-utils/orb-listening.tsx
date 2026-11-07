'use client';

import { BaseThinkingOrb } from './base-orb';
import type { OrbProps } from './types';

export function OrbListening(props: OrbProps) {
  return <BaseThinkingOrb mode="wave" caption="Listening" summary="Latitude rings breathing in and out on two detuned sine waves." frame={[240, 240]} {...props} />;
}
