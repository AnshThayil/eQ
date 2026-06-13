import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconProps } from './SortIcon';

export function EditIcon({ size = 24, color = '#c01752' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19.1171 9.3461C19.1171 9.3461 22.4645 5.9987 20.2329 3.76711C18.0013 1.53552 14.6539 4.88291 14.6539 4.88291L4.61344 14.9233C3.87851 15.6583 3.29826 16.5504 3.12162 17.5746C2.94326 18.6087 2.8839 19.8921 3.49591 20.5041C4.10791 21.1161 5.39128 21.0568 6.42542 20.8783C7.44963 20.7017 8.34171 20.1215 9.07664 19.3865L19.1171 9.3461ZM14.6539 4.88291L19.1171 9.3461"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
