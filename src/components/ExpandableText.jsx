/* eslint-disable react/prop-types */
import { useState } from "react";

const lineClampClass = {
  2: "line-clamp-2",
  3: "line-clamp-3",
};

const ExpandableText = ({
  children,
  className = "",
  lines = 2,
  minLength = 120,
  buttonClassName = "",
}) => {
  const [expanded, setExpanded] = useState(false);
  const text = typeof children === "string" ? children : "";
  const canExpand = text.length > minLength;
  const clampClass = lineClampClass[lines] || lineClampClass[2];

  return (
    <>
      <p
        className={`${className} ${
          canExpand && !expanded ? `${clampClass} md:line-clamp-none` : ""
        }`}
      >
        {children}
      </p>
      {canExpand && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className={`mt-1 text-xs font-semibold text-primary hover:text-primary/80 md:hidden ${buttonClassName}`}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </>
  );
};

export default ExpandableText;
