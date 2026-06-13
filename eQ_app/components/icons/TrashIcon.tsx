import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconProps } from './SortIcon';

export function TrashIcon({ size = 24, color = '#c01752' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M10 11V17" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 11V17" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 7H20" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M6 7H12H18V18C18 19.6569 16.6569 21 15 21H9C7.34315 21 6 19.6569 6 18V7Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
