import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function CompassFilledIcon({ size = 40, color = '#332F74' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Circle cx="20" cy="20" r="15.25" fill={color} stroke={color} strokeWidth="1.5" />
      <Path
        d="M25.4836 13.384L15.768 15.8445C15.393 15.9394 15.1064 16.2421 15.0321 16.6217L13.2903 25.5175C13.1526 26.2205 13.7772 26.836 14.4781 26.6881L24.1927 24.6379C24.5883 24.5544 24.8947 24.2409 24.9691 23.8435L26.712 14.5375C26.8464 13.8199 26.1914 13.2048 25.4836 13.384Z"
        stroke="white"
        strokeWidth="1.5"
      />
      <Circle cx="20" cy="20" r="2.25" stroke="white" strokeWidth="1.5" />
    </Svg>
  );
}
