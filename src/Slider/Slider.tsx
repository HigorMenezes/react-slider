import React, { useRef, FC, ReactNode } from "react";

import { Thumb } from "./Thumb";
import { TickMark } from "./TickMark";
import { Track } from "./Track";

import { useSlider } from "./hooks";

import "./styles/slider.css";
import { calculatePercentage, clamp } from "./utils";

export type SliderProps = {
  value?: number | number[];
  defaultValue?: number | number[];
  min?: number;
  max?: number;
  step?: number;
  swap?: boolean;
  trackPattern?: boolean[];
  marks?: boolean | number[];
  offset?: number;
};

export const Slider: FC<SliderProps> = ({
  value: valueProp,
  defaultValue: defaultValueProp,
  min = 0,
  max = 100,
  step: stepProp,
  swap = false,
  trackPattern = [],
  marks = false,
  offset = 0,
}) => {
  const step = stepProp && stepProp > 0 ? stepProp : 1;
  const normalizedValue = normalizeValue(valueProp)?.map((v) =>
    clamp(min, v, max, step)
  );
  const normalizedDefaultValue = normalizeValue(defaultValueProp)?.map((v) =>
    clamp(min, v, max, step)
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const thumbRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { value } = useSlider({
    rootRef,
    thumbRefs,
    value: normalizedValue,
    defaultValue: normalizedDefaultValue,
    min,
    max,
    step,
    swap,
    offset,
  });

  function renderTrack() {
    return (
      <span>
        {trackPattern.map((t, index) => {
          if (!t) {
            return null;
          }

          const prevValue = value[index - 1];
          const curValue = value[index];

          if (!prevValue && !curValue) {
            return null;
          }

          const startPercent = prevValue
            ? calculatePercentage(prevValue, min, max) * 100
            : 0;
          const endPercent = curValue
            ? 100 - calculatePercentage(curValue, min, max) * 100
            : 0;

          return (
            <Track
              key={`track_${index}`}
              aria-hidden
              style={{
                insetInline: `${startPercent}% ${endPercent}%`,
              }}
            />
          );
        })}
      </span>
    );
  }

  function renderTickMark() {
    function isActive(markValue: number) {
      for (let i = 0; i < value.length; i++) {
        if (markValue < value[i]) {
          return !!trackPattern[i];
        }
        if (markValue === value[i]) {
          return !!trackPattern[i] || !!trackPattern[i + 1];
        }
      }

      return !!trackPattern[value.length];
    }

    const tickMarks: ReactNode[] = [];

    if (marks === true) {
      for (let markValue = 0; markValue <= max; markValue += step) {
        tickMarks.push(
          <TickMark
            key={`tick_mark_${markValue}`}
            style={{
              insetInlineStart: `${
                calculatePercentage(markValue, min, max) * 100
              }%`,
            }}
            className={isActive(markValue) ? "active" : ""}
          />
        );
      }
    } else if (Array.isArray(marks)) {
      marks.forEach((markValue) => {
        tickMarks.push(
          <TickMark
            key={`tick_mark_${markValue}`}
            style={{
              insetInlineStart: `${
                calculatePercentage(markValue, min, max) * 100
              }%`,
            }}
            className={isActive(markValue) ? "active" : ""}
          />
        );
      });
    }

    return <span>{tickMarks}</span>;
  }

  function renderThumb() {
    return (
      <span>
        {value.map((v, index) => (
          <Thumb
            key={`thumb_${index}`}
            role="slider"
            tabIndex={0}
            aria-label={index === 0 ? "Value min: " : "Value max: "}
            aria-valuemin={min}
            aria-valuenow={v}
            aria-valuemax={max}
            style={{
              insetInlineStart: `${calculatePercentage(v, min, max) * 100}%`,
            }}
            ref={(el) => {
              thumbRefs.current[index] = el;
            }}
          />
        ))}
      </span>
    );
  }

  return (
    <div className="slider" ref={rootRef}>
      <div style={{ position: "absolute", inset: 0, insetInline: offset }}>
        {renderTrack()}
        {marks && renderTickMark()}
        {renderThumb()}
      </div>
    </div>
  );
};

function normalizeValue(value?: number | number[]) {
  return value !== undefined
    ? Array.isArray(value)
      ? value
      : [value]
    : undefined;
}
