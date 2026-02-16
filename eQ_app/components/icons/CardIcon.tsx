import React from 'react';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function CardIcon({ size = 40, color = '#332F74' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Defs>
        <ClipPath id="clip0_389_1204">
          <Rect width="40" height="40" fill="white" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#clip0_389_1204)">
        <Path
          d="M6.83288 9.37167L24.4547 3.685C30.1013 1.86281 31.9634 2.80306 33.76 8.37035L37.9623 21.3924C39.7589 26.9597 38.7977 28.8111 33.1669 30.6281L15.5292 36.3199C9.90362 38.1529 8.04155 37.2126 6.24495 31.6453L2.03752 18.6074C0.240926 13.0401 1.20215 11.1887 6.83288 9.37167Z"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M2.34976 19.575L34.0722 9.33793"
          stroke={color}
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M12.7891 30.2166L15.9614 29.1929"
          stroke={color}
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d="M19.9267 27.9131L26.2712 25.8657"
          stroke={color}
          strokeWidth="1.5"
          strokeMiterlimit="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </Svg>
  );
}
