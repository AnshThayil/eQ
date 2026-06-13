import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconProps } from './SortIcon';

export function CalendarIcon({ size = 24, color = '#C01752' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 11.55C3 8.15586 3 6.45881 4.05441 5.40439C5.10883 4.34998 6.80588 4.34998 10.2 4.34998H13.8C17.1941 4.34998 18.8912 4.34998 19.9456 5.40439C21 6.45881 21 8.15586 21 11.55V13.35C21 16.7441 21 18.4412 19.9456 19.4955C18.8912 20.55 17.1941 20.55 13.8 20.55H10.2C6.80588 20.55 5.10883 20.55 4.05441 19.4955C3 18.4412 3 16.7441 3 13.35V11.55Z"
        fill="white"
        stroke={color}
      />
      <Path d="M7.5 4.35V3" stroke={color} strokeLinecap="round" />
      <Path d="M16.5 4.35V3" stroke={color} strokeLinecap="round" />
      <Path d="M3 8.84998H21" stroke={color} strokeLinecap="round" />
    </Svg>
  );
}
