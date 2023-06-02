import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';

import App from './App';
import reportWebVitals from './reportWebVitals';

// Using styleLoader because Webpack with React-Router
// seems to load stylesheets referenced in router components first,
// then load App component's global styles
import './styles/styleLoader.css';


// Spotify SDK is not compatible with standard React 18
// DOM instantiation method, so app falls back on React 17 methods and packages
ReactDOM.render(
	<React.StrictMode>
		<CookiesProvider>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</CookiesProvider>
	</React.StrictMode>,
	document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
