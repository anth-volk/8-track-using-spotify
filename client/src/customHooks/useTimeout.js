import { useEffect, useRef } from 'react';

/** Custom hook for handling setTimeout within React
 * @param {function} callbackFunc Callback function to execute after delay
 * @param {number|null} delay Period of time for delay
 */
export function useTimeout(callbackFunc, delay) {

  // Ref for intervalID and callback;
  // Ref is needed for callback because after re-renders,
  // setTimeout will still refer to old props
  const timeoutID = useRef(null);
  const callbackRef = useRef(callbackFunc);

  // Save callback to ref after render
  useEffect(() => {
    callbackRef.current = callbackFunc;
  }, [callbackFunc]);

  // setTimeout using effect hook
  useEffect(() => {
    function currentCallback() {
      callbackRef.current();
    }

    if (delay !== null) {
      timeoutID.current = setTimeout(currentCallback, delay);
      return () => clearTimeout(timeoutID.current);
    }

  }, [callbackFunc, delay]);

  return timeoutID.current;

}
