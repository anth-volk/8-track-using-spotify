// External imports
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCookies } from 'react-cookie';

export default function Login() {

	// State variable object for controlled input
	const formObject = {
		email: '',
		password: '',
	};

	// Object for storing form errors
	const formErrorsObject = {
		email: '',
		password: '',
	};

	const [form, setForm] = useState(formObject);
	const [formErrors, setFormErrors] = useState(formErrorsObject);
	const [submissionMessage, setSubmissionMessage] = useState('');
	const [userToken, setUserToken] = useState(null);

	const [cookies, setCookie, removeCookie] = useCookies();

	// Declare navigate from react-router-dom in order to use inside submit handler
	const navigate = useNavigate();

	// Create new timer Ref for use with later setTimeout
	const timerRef = useRef(null);

	// Function to validate form upon submission
	function handleValidation() {

		// Store error messages
		let errors = {};

		// Bool for whether or not form is valid
		let isValid = true;

		// Map over form keys
		Object.keys(form)
			.forEach( (formElementKey) => {

				// If the element exists...
				if(form[formElementKey]) {

					switch (formElementKey) {
						// Validate email addresses against regex from https://www.w3resource.com/javascript/form/email-validation.php
						case 'email':
							if (!form[formElementKey].match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
								errors.email = 'Must input a valid email address';
								isValid = false;
							} else {
								errors.email = '';
							}
							break;
						// For everything else, as long as a value exists, ensure that no errors are listed
						default:
							errors[formElementKey] = '';
							break;
					}
				} 
				// If the value is blank, add the below as an error message
				else {
					errors[formElementKey] = 'This field is required';
					isValid = false;
				}

			})
		
		// Set formErrors based on the errors accumulated
		setFormErrors( (prev) => ({
			...prev,
			...errors
		}));
		
		return isValid;
		
	}

	// Form input handler
	function handleFormChange(event) {
		const { name, value } = event.target;
		setForm(prev => ({
			...prev,
			[name]: value
		}));
	};

	// Form submission handler
	async function handleFormSubmit(event) {
		// Prevent default web redirect
		event.preventDefault();

		// Validate form
		const isFormValid = handleValidation();

		console.log('isFormValid: ', isFormValid);

		// If the form is valid...
		if (isFormValid) {

			// Submit data to API endpoint via POST request
			const res = await fetch(process.env.REACT_APP_BACKEND_TLD + '/api/v1/user_auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'CORS': 'Access-Control-Allow-Origin'
				},
				body: JSON.stringify(form)
			});

			// Convert response to JSON
			const resJSON = await res.json();

			// If signup is successful per returned JSON object...
			if (resJSON.connection_status === 'success' && resJSON.data_status === 'user_exists') {

				// TESTING
				console.log(resJSON);
				setUserToken(resJSON.user_token);

				// Clear any existing timeout
				clearTimeout(timerRef.current);

				// Set a positive submission message
				setSubmissionMessage('Successfully logged in. Redirecting to your library page...');
				
				// Wait 3 seconds, then navigate to '/' route
				timerRef.current = setTimeout(() => {
					navigate('/library');
				}, 3000);
				
			} 
			// Otherwise, set negative submission message
			else {
				setSubmissionMessage('Unable to access account. Please try again.')
			}
		}
	}

	// Clear any existing timeouts upon re-render
	useEffect(() => {
		return () => clearTimeout(timerRef.current);
	}, [])

	// Store user object to local storage
	useEffect(() => {

		if(userToken) {

			const maxAge = 60 * 60 * 24 * 30;

			setCookie(
				'userAuth',
				userToken,
				{
					path: '/',
					maxAge: maxAge
				}
			)

		}

	}, [userToken, setCookie])

	return(
		<div className='Login'>
			<div className='Login_container'>
				<h1 className='Login_logoText'>TEXT PLACEHOLDER</h1>
				<h2 className='Login_title'>Log In</h2>
				<form className='Login_form' onSubmit={handleFormSubmit}>
					<label htmlFor='email'>Email Address</label>
					<input className='Login_textInput' type='email' name='email' value={form.email} onChange={handleFormChange} placeholder='Email Address'></input>
					<p className='Login_validationText'>{formErrors.email}</p>
					<label htmlFor='password'>Password</label>
					<input className='Login_textInput' type='password' name='password' value={form.password} onChange={handleFormChange}></input>
					<p className='Login_validationText'>{formErrors.password}</p>
					<button type='submit' className='Util_button'>Log In</button>
				</form>
				<Link to='/signup'>I don't have an account yet</Link>
				<p className='Login_submissionMessage'>{submissionMessage}</p>
			</div>
		</div>
	)
}