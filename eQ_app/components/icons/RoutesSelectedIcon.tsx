import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function RoutesSelectedIcon({ size = 40, color = '#332F74' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Circle cx="20.5" cy="20.5" r="16.5" fill={color} />
      <Path
        d="M15.8244 29.4594C15.8244 29.4594 9.44962 23.8709 13.1607 20.4999C16.6269 17.3513 23.269 25.0893 26.4647 22.2703C30.6918 18.5415 21.9242 12.8108 21.9242 12.8108"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Circle
        cx="18.8919"
        cy="32.8919"
        r="1.14189"
        fill="white"
        stroke="white"
        strokeWidth="1.5"
      />
      <Path
        d="M19.7573 9.04984L17.6488 10.6493L17.3171 8.02411L19.7573 9.04984Z"
        fill="white"
        stroke="white"
        strokeWidth="1.5"
      />
    </Svg>
  );
}
