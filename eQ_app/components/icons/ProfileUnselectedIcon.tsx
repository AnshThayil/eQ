import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function ProfileUnselectedIcon({ size = 40, color = '#332F74' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path
        d="M20.2011 21.3C20.0844 21.2833 19.9344 21.2833 19.8011 21.3C16.8678 21.2 14.5344 18.8 14.5344 15.85C14.5344 12.8333 16.9678 10.3833 20.0011 10.3833C23.0178 10.3833 25.4678 12.8333 25.4678 15.85C25.4511 18.8 23.1344 21.2 20.2011 21.3Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M31.2331 32.3002C28.2664 35.0168 24.3331 36.6668 19.9997 36.6668C15.6664 36.6668 11.733 35.0168 8.76636 32.3002C8.93302 30.7335 9.93302 29.2002 11.7164 28.0002C16.283 24.9668 23.7497 24.9668 28.2831 28.0002C30.0664 29.2002 31.0664 30.7335 31.2331 32.3002Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19.9999 36.6667C29.2046 36.6667 36.6666 29.2047 36.6666 20C36.6666 10.7953 29.2046 3.33334 19.9999 3.33334C10.7952 3.33334 3.33325 10.7953 3.33325 20C3.33325 29.2047 10.7952 36.6667 19.9999 36.6667Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
