import React from 'react';
import Svg, { Path } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
}

export function LeaderboardUnselectedIcon({ size = 40, color = '#332F74' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <Path
        d="M32.8337 20.75H26.1667C26.1447 20.75 26.1238 20.7589 26.1082 20.7744C26.0926 20.79 26.0838 20.811 26.0837 20.833V32.583H32.9167V20.833C32.9167 20.811 32.9079 20.79 32.8923 20.7744C32.8768 20.7589 32.8557 20.7501 32.8337 20.75Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M23.167 7.41663H16.5C16.478 7.41663 16.457 7.42551 16.4414 7.44104C16.4259 7.45659 16.4171 7.47765 16.417 7.49963V32.5836H23.25V7.49963C23.2499 7.47765 23.2411 7.45659 23.2256 7.44104C23.21 7.42549 23.189 7.41671 23.167 7.41663Z"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M13.5005 14.0834H6.8335C6.81147 14.0834 6.79051 14.0923 6.7749 14.1078C6.75935 14.1233 6.75057 14.1444 6.75049 14.1664V32.5834H13.5835V14.1664C13.5834 14.1444 13.5746 14.1233 13.5591 14.1078C13.5435 14.0922 13.5225 14.0835 13.5005 14.0834Z"
        stroke={color}
        strokeWidth="1.5"
      />
    </Svg>
  );
}
