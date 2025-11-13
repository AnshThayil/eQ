import React from 'react';
import Svg, { Mask, Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function CheckboxSelectedIcon({ size = 24, color = '#332F74' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Mask id="path-1-inside-1_136_1560" fill="white">
        <Path d="M0 2C0 0.89543 0.895431 0 2 0H22C23.1046 0 24 0.895431 24 2V22C24 23.1046 23.1046 24 22 24H2C0.89543 24 0 23.1046 0 22V2Z"/>
      </Mask>
      <Path 
        d="M0 2C0 0.89543 0.895431 0 2 0H22C23.1046 0 24 0.895431 24 2V22C24 23.1046 23.1046 24 22 24H2C0.89543 24 0 23.1046 0 22V2Z" 
        fill={color}
      />
      <Path 
        d="M2 0V2H22V0V-2H2V0ZM24 2H22V22H24H26V2H24ZM22 24V22H2V24V26H22V24ZM0 22H2V2H0H-2V22H0ZM2 24V22H2H0H-2C-2 24.2091 -0.20914 26 2 26V24ZM24 22H22V24V26C24.2091 26 26 24.2091 26 22H24ZM22 0V2H24H26C26 -0.209138 24.2091 -2 22 -2V0ZM2 0V-2C-0.209138 -2 -2 -0.20914 -2 2H0H2V2V0Z" 
        fill={color}
        mask="url(#path-1-inside-1_136_1560)"
      />
      <Path 
        d="M6 12.4169L9.71215 16L18 8" 
        stroke="white" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </Svg>
  );
}
