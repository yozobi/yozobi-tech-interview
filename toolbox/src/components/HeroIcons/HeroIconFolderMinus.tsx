import React, { SVGAttributes } from 'react';

function HeroIconFolderMinus(props: SVGAttributes<HTMLOrSVGElement>) {
  return (
    <svg
      {...props}
      className={`fill-current ${props.className}`}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path d="M20 6a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2h7.41l2 2H20zM4 6v12h16V8h-7.41l-2-2H4zm12 7a1 1 0 01-1 1H9a1 1 0 010-2h6a1 1 0 011 1z"></path>
    </svg>
  );
}

export default HeroIconFolderMinus;
