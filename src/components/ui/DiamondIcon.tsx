import React from 'react';
import Svg, { Path } from 'react-native-svg';

export default function DiamondIcon({ size = 24, color = "#2980B9" }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
    >
      <Path
        d="M32 58L4 22L14 6H50L60 22L32 58Z"
        stroke={color}
        strokeWidth="4"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M14 6L32 22L50 6"
        stroke={color}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <Path
        d="M4 22H60"
        stroke={color}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <Path
        d="M32 22L20 58"
        stroke={color}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <Path
        d="M32 22L44 58"
        stroke={color}
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
