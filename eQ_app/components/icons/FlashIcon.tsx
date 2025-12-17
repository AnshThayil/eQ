import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function FlashIcon({ size = 16, color = '#57830A' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M4.05938 8.85327H6.11938V13.6533C6.11938 14.7733 6.72602 14.9999 7.46602 14.1599L12.5127 8.4266C13.1327 7.7266 12.8727 7.1466 11.9327 7.1466H9.87269V2.3466C9.87269 1.2266 9.26602 0.999937 8.52602 1.83994L3.47938 7.57327C2.86604 8.27994 3.12604 8.85327 4.05938 8.85327Z"
        fill={color}
      />
    </Svg>
  );
}
