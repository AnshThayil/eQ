import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function LocationPinIcon({ size = 24, color = '#332F74' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3.61995 8.49C5.58995 -0.169998 18.4199 -0.159997 20.3799 8.5C21.5299 13.58 18.3699 17.88 15.5999 20.54C13.5899 22.48 10.4099 22.48 8.38995 20.54C5.62995 17.88 2.46995 13.57 3.61995 8.49Z"
        fill={color}
        stroke={color}
      />
      <Path
        d="M11.9999 13.4299C13.723 13.4299 15.1199 12.0331 15.1199 10.3099C15.1199 8.58681 13.723 7.18994 11.9999 7.18994C10.2768 7.18994 8.87988 8.58681 8.87988 10.3099C8.87988 12.0331 10.2768 13.4299 11.9999 13.4299Z"
        fill="white"
        stroke="white"
      />
    </Svg>
  );
}
