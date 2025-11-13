import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function FilterIcon({ size = 24, color = '#C01752' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <G clipPath="url(#clip0_13_153)">
        <Path
          d="M4 5H16"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M4 12H10"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M14 12H20"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M8 19H20"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M18 7C19.1046 7 20 6.10457 20 5C20 3.89543 19.1046 3 18 3C16.8954 3 16 3.89543 16 5C16 6.10457 16.8954 7 18 7Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M12 14C13.1046 14 14 13.1046 14 12C14 10.8954 13.1046 10 12 10C10.8954 10 10 10.8954 10 12C10 13.1046 10.8954 14 12 14Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <Path
          d="M6 21C7.10457 21 8 20.1046 8 19C8 17.8954 7.10457 17 6 17C4.89543 17 4 17.8954 4 19C4 20.1046 4.89543 21 6 21Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_13_153">
          <Rect width="24" height="24" fill="white" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}
