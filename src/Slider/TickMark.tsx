import React, { ComponentPropsWithoutRef, FC } from "react";

export const TickMark: FC<ComponentPropsWithoutRef<"div">> = ({
  className,
  ...props
}) => {
  return <div className={`slider__tick-mark ${className || ""}`} {...props} />;
};
