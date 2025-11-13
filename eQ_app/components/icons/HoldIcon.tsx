import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function HoldIcon({ size = 27, color = '#FD8032' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 27 27" fill="none">
      <Path
        d="M18.8764 5.90373C11.4013 13.2599 -5.43837 6.70511 8.70469 21.3685C22.8478 36.0318 26.3514 -1.45244 18.8764 5.90373Z"
        fill={color}
      />
      <Path
        d="M15.3824 23.1951C17.2617 22.5762 19.7497 17.8345 16.7708 20.6485C13.7919 23.4626 11.1442 20.2046 10.0285 20.0374C8.91269 19.8703 13.503 23.814 15.3824 23.1951Z"
        fill="white"
      />
      <Circle
        cx="14.1806"
        cy="11.7946"
        r="0.696545"
        transform="rotate(67.8737 14.1806 11.7946)"
        fill="white"
      />
    </Svg>
  );
}
