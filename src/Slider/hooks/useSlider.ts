import {
  RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { clamp, getOwnerDocument } from "../utils";
import { calculatePercentage } from "../utils/calculatePercentage";
import { useEventCallback } from "./useEventCallback";

export type UseSliderProps = {
  rootRef: RefObject<HTMLDivElement>;
  thumbRefs: RefObject<(HTMLDivElement | null)[]>;
  value?: number[];
  defaultValue?: number[];
  min: number;
  max: number;
  step: number;
  swap: boolean;
  offset: number;
};

export function useSlider({
  rootRef,
  thumbRefs,
  value: valueProp,
  defaultValue: defaultValueProp,
  min,
  max,
  step,
  swap,
  offset,
}: UseSliderProps) {
  const [value, setValue] = useState(
    valueProp || defaultValueProp || [clamp(min, (min + max) / 2, max, step)]
  );

  const sliderDataRef = useRef({
    value: value,
    currentThumbIndex: -1,
    tempSwap: false,
  });

  /** START: Utils functions */
  const sortValue = useCallback(
    (value: number[]) => {
      const copyValue = [...value];

      for (let i = 0; i < copyValue.length; i++) {
        for (let j = i; j < copyValue.length; j++) {
          if (copyValue[i] > copyValue[j]) {
            const aux = copyValue[i];
            copyValue[i] = copyValue[j];
            copyValue[j] = aux;

            if (sliderDataRef.current.currentThumbIndex === i) {
              sliderDataRef.current.currentThumbIndex = j;
              thumbRefs.current?.[j]?.focus();
            } else if (sliderDataRef.current.currentThumbIndex === j) {
              sliderDataRef.current.currentThumbIndex = i;
              thumbRefs.current?.[i]?.focus();
            }
          }
        }
      }

      return copyValue;
    },
    [thumbRefs]
  );

  const updateValue = useCallback(
    (newValue: number) => {
      const lastValue = sliderDataRef.current.value;

      let valueCopy = [...lastValue];

      valueCopy[sliderDataRef.current.currentThumbIndex] = newValue;

      if (!sliderDataRef.current.tempSwap && !swap && !isArraySort(valueCopy)) {
        return;
      }

      valueCopy = sortValue(valueCopy);

      if (!isArrayEqual(lastValue, valueCopy)) {
        sliderDataRef.current.tempSwap = false;
        sliderDataRef.current.value = valueCopy;
        setValue(valueCopy);
      }
    },
    [sortValue, swap]
  );

  const getValueFromPercent = useCallback(
    (percent: number) => {
      const sliderLength = Math.abs(max - min);
      const value = min + percent * sliderLength;
      return clamp(min, value, max, step);
    },
    [max, min, step]
  );

  const calculateValueFromPosition = useCallback(
    (position: number) => {
      const { x, width } = getScreenElementPosition(rootRef.current!);
      const percent = calculatePercentage(
        position,
        x + offset,
        x + width - offset
      );
      return getValueFromPercent(percent);
    },
    [rootRef, getValueFromPercent, offset]
  );

  const getClosestThumbIndexFromTouch = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const { x: touchPosition } = getScreenTouchPosition(e);
      const touchPositionValue = calculateValueFromPosition(touchPosition);

      const closestIndexes = getClosestValueIndexes(value, touchPositionValue);

      return closestIndexes;
    },
    [calculateValueFromPosition, value]
  );

  const recalculateThumbPosition = useCallback(
    (e: MouseEvent | TouchEvent, withAnimation?: boolean) => {
      if (withAnimation) {
        rootRef.current?.classList.add("slider--animation");
      } else {
        rootRef.current?.classList.remove("slider--animation");
      }

      const { x: touchPosition } = getScreenTouchPosition(e);
      const touchPositionValue = calculateValueFromPosition(touchPosition);
      updateValue(touchPositionValue);
    },
    [calculateValueFromPosition, updateValue, rootRef]
  );
  /** END: Utils functions */

  /** START: Mouse/Touch move handlers */
  const touchMoveHandler = useEventCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    recalculateThumbPosition(e);
  });

  const touchEndHandler = useEventCallback((e: MouseEvent | TouchEvent) => {
    removeDraggingListeners();
  });
  /** END: Mouse handlers */

  /** START: Dragging listeners */
  const addDraggingListeners = useCallback(() => {
    const docOwner = getOwnerDocument(rootRef.current);
    docOwner.addEventListener("mousemove", touchMoveHandler);
    docOwner.addEventListener("touchmove", touchMoveHandler);
    docOwner.addEventListener("mouseup", touchEndHandler, {
      once: true,
    });
    docOwner.addEventListener("touchend", touchEndHandler, {
      once: true,
    });
  }, [rootRef, touchEndHandler, touchMoveHandler]);

  const removeDraggingListeners = useCallback(() => {
    const docOwner = getOwnerDocument(rootRef.current);
    docOwner.removeEventListener("mousemove", touchMoveHandler);
    docOwner.removeEventListener("touchmove", touchMoveHandler);
    docOwner.removeEventListener("mouseup", touchEndHandler);
    docOwner.removeEventListener("touchend", touchEndHandler);
  }, [rootRef, touchEndHandler, touchMoveHandler]);

  /** END: Dragging listeners */

  const touchStartHandler = useEventCallback((e: TouchEvent | MouseEvent) => {
    e.preventDefault();
    const closestIndexes = getClosestThumbIndexFromTouch(e);
    if (closestIndexes.length > 1) {
      sliderDataRef.current.tempSwap = true;
    }
    sliderDataRef.current.currentThumbIndex = closestIndexes[0];
    thumbRefs.current?.[closestIndexes[0]]?.focus();
    recalculateThumbPosition(e, true);
    addDraggingListeners();
  });

  // Touch EventListeners
  useLayoutEffect(() => {
    const rootEl = rootRef.current;

    rootEl?.addEventListener("mousedown", touchStartHandler);
    rootEl?.addEventListener("touchstart", touchStartHandler);

    return () => {
      rootEl?.removeEventListener("mousedown", touchStartHandler);
      rootEl?.removeEventListener("touchstart", touchStartHandler);
      removeDraggingListeners();
    };
  }, [rootRef, removeDraggingListeners, touchStartHandler]);

  /** START: Keydown handlers */
  const keydownHandler = useEventCallback((e: KeyboardEvent) => {
    rootRef.current?.classList.remove("slider--animation");

    const thumbIndex = thumbRefs.current?.indexOf(e.currentTarget as any);

    if (thumbIndex === undefined) {
      return;
    }

    sliderDataRef.current.currentThumbIndex = thumbIndex;

    let newValue: number | undefined = undefined;

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
        newValue = sliderDataRef.current.value[thumbIndex] - step;
        break;
      case "ArrowRight":
      case "ArrowUp":
        newValue = sliderDataRef.current.value[thumbIndex] + step;
        break;

      case "PageDown":
        newValue = sliderDataRef.current.value[thumbIndex] - step * 10;
        break;

      case "PageUp":
        newValue = sliderDataRef.current.value[thumbIndex] + step * 10;
        break;

      case "Home":
        newValue = min;
        break;

      case "End":
        newValue = max;
        break;

      default:
        break;
    }

    if (newValue !== undefined) {
      updateValue(clamp(min, newValue, max, step));
    }
  });

  /** END: Mouse handlers */

  /** START: Keyboard listeners */
  const addKeyboardListeners = useCallback(() => {
    thumbRefs.current?.forEach((thumbEl) => {
      thumbEl?.addEventListener("keydown", keydownHandler);
    });
  }, [thumbRefs, keydownHandler]);

  const removeKeyboardListeners = useCallback(() => {}, []);
  /** END: Dragging listeners */

  // Keyboard Event listeners
  useLayoutEffect(() => {
    addKeyboardListeners();

    return () => {
      removeKeyboardListeners();
    };
  }, [addKeyboardListeners, removeKeyboardListeners]);

  return { value };
}

function isTouchEvent(e: MouseEvent | TouchEvent): e is TouchEvent {
  return !!(e as TouchEvent).changedTouches;
}

function getScreenTouchPosition(e: MouseEvent | TouchEvent) {
  const { clientX, clientY } = isTouchEvent(e) ? e.changedTouches[0] : e;
  return { x: clientX, y: clientY };
}

function getScreenElementPosition(el: HTMLElement) {
  const { x, y, width, height } = el.getBoundingClientRect();
  return {
    x,
    y,
    width,
    height,
  };
}

function getAllIndexOf(values: number[], value: number) {
  const indexes = [];
  let i = -1;

  while ((i = values.indexOf(value, i + 1)) !== -1) {
    indexes.push(i);
  }

  return indexes;
}

function getClosestValueIndexes(values: number[], value: number) {
  let closestDistance = +Infinity;
  let closestValueIndex = 0;

  for (let i = 0; i < values.length; i++) {
    if (Math.abs(values[i] - value) < closestDistance) {
      closestDistance = Math.abs(values[i] - value);
      closestValueIndex = i;
    } else {
      break;
    }
  }

  const indexes = getAllIndexOf(values, values[closestValueIndex]);

  return indexes;
}

function isArraySort(arr: number[]) {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) {
      return false;
    }
  }

  return true;
}

function isArrayEqual<T extends unknown[]>(arr1: T, arr2: T) {
  return (
    arr1.length === arr2.length &&
    arr1.every((val, index) => val === arr2[index])
  );
}
