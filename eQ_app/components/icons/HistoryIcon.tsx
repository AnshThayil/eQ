import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function HistoryIcon({ size = 19, color = '#C01752' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 19 19" fill="none">
      <Path
        d="M0.543559 8.85714C0.00565339 14.5 4.56454 18.5 9.52466 18.5C14.4848 18.5 18.5058 14.4706 18.5058 9.5C18.5058 4.52944 14.4848 0.5 9.52466 0.5C4.56454 0.5 2.53936 4 2.53936 4"
        stroke={color}
        strokeLinecap="round"
      />
      <Path
        d="M2.00565 2V4C2.00565 4.27614 2.22951 4.5 2.50565 4.5H4.50565"
        stroke={color}
        strokeLinecap="round"
      />
      <Path
        d="M9.50565 6.5V10.5L12.0057 13"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}