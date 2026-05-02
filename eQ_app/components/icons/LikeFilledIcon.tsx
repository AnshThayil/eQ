import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function LikeFilledIcon({ size = 18, color = '#D97497' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 16" fill="none">
      <Path
        d="M0 5.43913C0 9.95879 3.61749 12.3673 6.26556 14.5231C7.2 15.2838 8.1 16 9 16C9.9 16 10.8 15.2838 11.7345 14.5231C14.3825 12.3673 18 9.95879 18 5.43913C18 0.919426 13.0498 -2.28585 9 2.05933C4.95014 -2.28585 0 0.919426 0 5.43913Z"
        fill={color}
      />
    </Svg>
  );
}