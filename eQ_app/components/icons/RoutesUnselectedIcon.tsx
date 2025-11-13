import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function RoutesUnselectedIcon({ size = 40, color = '#332F74' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path
        d="M15.8244 28.4594C15.8244 28.4594 9.44962 22.8708 13.1607 19.4999C16.6269 16.3513 23.269 24.0893 26.4647 21.2702C30.6918 17.5414 21.9242 11.8107 21.9242 11.8107"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Circle cx="18.8919" cy="31.8918" r="1.89189" fill={color} />
      <Path
        d="M16.455 6.17307C16.4357 6.02032 16.589 5.90401 16.731 5.96371L20.925 7.72818C21.067 7.78789 21.091 7.97883 20.9684 8.07187L17.3432 10.8218C17.2206 10.9149 17.0432 10.8403 17.0239 10.6875L16.455 6.17307Z"
        fill={color}
      />
    </Svg>
  );
}
