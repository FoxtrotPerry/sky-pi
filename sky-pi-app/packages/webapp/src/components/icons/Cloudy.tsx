import React, { type SVGProps } from "react";

type CloudyProps = SVGProps<SVGSVGElement> & {
  size?: "small" | "medium" | "large";
};

export const Cloudy = (props: CloudyProps) => {
  const pixels = (() => {
    switch (props.size) {
      case "large":
        return 48;
      case "medium":
        return 36;
      case "small":
        return 24;
      default:
        return 24;
    }
  })();
  return (
    <svg
      fill="#000000"
      width={pixels}
      height={pixels}
      viewBox={`0 0 ${pixels} ${pixels}`}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6.34141 9C7.16508 6.66962 9.38756 5 12 5C15.3137 5 18 7.68629 18 11C20.2091 11 22 12.7909 22 15C22 17.2091 20.2091 19 18 19H7C4.23858 19 2 16.7614 2 14C2 11.469 3.8806 9.37721 6.32069 9.04576"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
