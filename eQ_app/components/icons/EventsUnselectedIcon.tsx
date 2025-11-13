import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function EventsUnselectedIcon({ size = 40, color = '#332F74' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path
        d="M5 19.25C5 13.5931 5 10.7647 6.75736 9.00735C8.51473 7.25 11.3431 7.25 17 7.25H23C28.6568 7.25 31.4853 7.25 33.2426 9.00735C35 10.7647 35 13.5931 35 19.25V22.25C35 27.9068 35 30.7354 33.2426 32.4926C31.4853 34.25 28.6568 34.25 23 34.25H17C11.3431 34.25 8.51473 34.25 6.75736 32.4926C5 30.7354 5 27.9068 5 22.25V19.25Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M12.5 7.25V5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M27.5 7.25V5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M5 14.75H35"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}
