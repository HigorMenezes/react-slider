import React, { ComponentPropsWithoutRef, forwardRef } from "react";

export const Thumb = forwardRef<
  HTMLDivElement,
  ComponentPropsWithoutRef<"div">
>((props, ref) => {
  return (
    <div className="slider__thumb" {...props} ref={ref}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        {props["aria-valuenow"]}
      </div>
    </div>
  );
});
