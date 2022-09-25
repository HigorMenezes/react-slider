import React, { ComponentPropsWithoutRef, FC } from "react";

export type TrackProps = ComponentPropsWithoutRef<"div">;

export const Track: FC<TrackProps> = (props) => {
  return <div className="slider__track" {...props} />;
};
