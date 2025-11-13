import React from 'react';
import Svg, { Mask, Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function CheckboxUnselectedIcon({ size = 24, color = '#332F74' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Mask id="path-1-inside-1_33_854" fill="white">
        <Path d="M0 2C0 0.89543 0.895431 0 2 0H22C23.1046 0 24 0.895431 24 2V22C24 23.1046 23.1046 24 22 24H2C0.89543 24 0 23.1046 0 22V2Z"/>
      </Mask>
      <Path 
        d="M2 0V1H22V0V-1H2V0ZM24 2H23V22H24H25V2H24ZM22 24V23H2V24V25H22V24ZM0 22H1V2H0H-1V22H0ZM2 24V23C1.44772 23 1 22.5523 1 22H0H-1C-1 23.6569 0.343145 25 2 25V24ZM24 22H23C23 22.5523 22.5523 23 22 23V24V25C23.6569 25 25 23.6569 25 22H24ZM22 0V1C22.5523 1 23 1.44772 23 2H24H25C25 0.343146 23.6569 -1 22 -1V0ZM2 0V-1C0.343146 -1 -1 0.343145 -1 2H0H1C1 1.44772 1.44772 1 2 1V0Z" 
        fill={color}
        mask="url(#path-1-inside-1_33_854)"
      />
    </Svg>
  );
}
