// External imports


// Component imports
import Navbar from './components/Navbar.js';

// Style imports
import './styles/App.css';

function App() {

	// Determine if user is authenticated or not; is it possible to somehow pass req.session to app?

	return (
		<div className="App">
			<Navbar />
		</div>
	);
}

export default App;
