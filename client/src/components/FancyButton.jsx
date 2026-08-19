import React from "react";
import { Link } from "react-router-dom";
import "../styles/fancy-button.css";

// Modern arrow function, inuitive prop order, clean disables + aria support
const FancyButton = ({
  to,
  children,
  className = "",
  as = "button",
  type = "button",
  disabled = false,
  invert = false,
  ...rest
}) => {
  const classes = `fancy${invert ? " fancy--invert" : ""} ${className}`.trim();

  const content = (
    <>
      <span className="top-key" />
      <span className="text">{children}</span>
      <span className="bottom-key-1" />
      <span className="bottom-key-2" />
    </>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={classes}
        aria-disabled={disabled ? "true" : undefined}
        tabIndex={disabled ? -1 : undefined}
        {...rest}
      >
        {content}
      </Link>
    );
  }

  const Comp = as === "a" ? "a" : "button";
  return (
    <Comp
      type={Comp === "button" ? type : undefined}
      className={classes}
      disabled={Comp === "button" ? disabled : undefined}
      aria-disabled={disabled ? "true" : undefined}
      tabIndex={disabled ? -1 : undefined}
      {...rest}
    >
      {content}
    </Comp>
  );
};

export default FancyButton;
