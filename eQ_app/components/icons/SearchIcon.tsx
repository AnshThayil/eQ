import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function SearchIcon({ size = 24, color = '#332F74' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.5 2C5.80558 2 2 5.80558 2 10.5C2 15.1944 5.80558 19 10.5 19C12.4869 19 14.3146 18.3183 15.7618 17.1799L20.2929 21.7109C20.6834 22.1014 21.3166 22.1014 21.7071 21.7109C22.0976 21.3204 22.0976 20.6873 21.7071 20.2968L17.1761 15.7658C18.3145 14.3186 19 12.4869 19 10.5C19 5.80558 15.1944 2 10.5 2ZM4 10.5C4 6.91015 6.91015 4 10.5 4C14.0899 4 17 6.91015 17 10.5C17 14.0899 14.0899 17 10.5 17C6.91015 17 4 14.0899 4 10.5Z"
        fill={color}
      />
    </Svg>
  );
}
