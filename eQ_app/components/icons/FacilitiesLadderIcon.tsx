import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function FacilitiesLadderIcon({ size = 40, color = '#332F74' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path
        d="M15.2205 5.02148C15.2205 5.02148 12.0592 4.9776 10.742 6.07525C9.42479 7.1729 9.16136 8.44623 8.89794 10.5538C8.63452 12.6613 8.8979 29.5214 8.8979 29.5214"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M30.5002 5.0215C30.5002 5.0215 27.8658 4.75807 26.2851 6.07528C25.4265 6.79079 24.1776 7.91937 24.1776 10.5538C24.1776 11.2251 24.1776 12.3629 24.1776 13.7151M24.1776 25.043C24.1776 25.043 24.1776 23.8553 24.1776 22.1452M24.1776 13.7151H8.89806M24.1776 13.7151C24.1776 16.3315 24.1776 19.7505 24.1776 22.1452M24.1776 22.1452H8.89806"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M6 31.3658C6 31.3658 8.89785 34.0002 11.7957 34.0002C16.9036 34.0002 20.3867 29.7852 25.4946 29.7852C29.1828 29.7852 33.1344 32.1561 33.1344 32.1561"
        stroke={color}
        strokeWidth="1.5"
      />
    </Svg>
  );
}
