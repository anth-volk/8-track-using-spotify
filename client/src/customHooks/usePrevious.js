// External imports
import {
	useEffect,
	useRef
} from 'react';

// Taken and modified from tutorial at https://blog.logrocket.com/accessing-previous-props-state-react-hooks/
export function usePrevious(value) {
	const ref = useRef(null);
	useEffect(() => {
		ref.current = value;
	}, [value]);
	return ref.current;
}