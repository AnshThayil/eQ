import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function ShopIcon({ size = 40, color = '#332F74' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path
        d="M15 9.99992V8.33325C15 5.57184 17.2385 3.33325 20 3.33325C22.7615 3.33325 25 5.57184 25 8.33325V9.99992"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M15.2848 25C15.9712 26.942 17.8233 28.3333 20.0003 28.3333C22.1773 28.3333 24.0295 26.942 24.7158 25"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <Path
        d="M34.9227 28.3333C33.9472 23.1314 32.2427 13.0732 30.3912 11.5366C28.5397 10 25.8935 10 20.6008 10H19.3988C14.1062 10 11.4599 10 9.60843 11.5366C7.75693 13.0732 7.26924 15.6742 6.29388 20.8762C4.92233 28.191 4.23656 31.8485 6.23594 34.2575C8.23531 36.6667 11.9565 36.6667 19.3988 36.6667H20.6008C28.0432 36.6667 31.7643 36.6667 33.7637 34.2575C34.9237 32.8598 35.1798 31.042 34.9227 28.3333Z"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}
