// External imports
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Signup() {

	// State variable object for controlled input
	const formObject = {
		fname: '',
		lname: '',
		email: '',
		password: '',
		confirmPassword: ''
	};

	// Object for storing form errors
	const formErrorsObject = {
		fname: '',
		lname: '',
		email: '',
		password: '',
		confirmPassword: ''
	};

	const [form, setForm] = useState(formObject);
	const [formErrors, setFormErrors] = useState(formErrorsObject);
	const [submissionMessage, setSubmissionMessage] = useState('');

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
			.forEach((formElementKey) => {

				// If the element exists...
				if (form[formElementKey]) {

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
						// Validate that passwords match; this does not currently constrain passwords to any set values
						case 'password':
							if (form[formElementKey] !== form.confirmPassword) {
								const pwdErrMsg = 'Passwords must match'
								errors.password = pwdErrMsg;
								errors.confirmPassword = pwdErrMsg;
								isValid = false;
							} else {
								errors.password = '';
								errors.confirmPassword = '';
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
		setFormErrors((prev) => ({
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

		// If the form is valid...
		if (isFormValid) {

			let res = null;

			try {
				// Submit data to API endpoint via POST request
				res = await fetch(process.env.REACT_APP_BACKEND_TLD + '/api/v1/user_auth/signup', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'CORS': 'Access-Control-Allow-Origin'
					},
					body: JSON.stringify(form)
				});
				setSubmissionMessage('');
			} catch (err) {
				console.error(err);
				setSubmissionMessage('Server error while trying to sign up. Please try again later.');
			}

			// Convert response to JSON
			if (res) {
				const resJSON = await res.json();

				// If signup is successful per returned JSON object...
				if (resJSON.status === 'success') {
					// Clear any existing timeout
					clearTimeout(timerRef.current);

					// Set a positive submission message
					setSubmissionMessage('Successfully registered account. Please log in. Redirecting to home page in 3 seconds...');

					// Wait 3 seconds, then navigate to '/' route
					timerRef.current = setTimeout(() => {
						navigate('/');
					}, 3000);

				}
				// Otherwise, set negative submission message
				else {
					setSubmissionMessage('Unable to create account. Please try again.')
				}
			}
		}
	}

	// Clear any existing timeouts upon re-render
	useEffect(() => {
		return () => clearTimeout(timerRef.current);
	}, [])

	return (
		<div className='Signup'>
			<div className='Signup_container'>
				<h1 className='Signup_title'>Sign Up</h1>
				<form className='Signup_form' onSubmit={handleFormSubmit}>
					<div className='Signup_form_unit'>
						<label className='Signup_label' htmlFor='fname'>First Name</label>
						<input className='Signup_textInput' type='text' name='fname' value={form.fname} onChange={handleFormChange} placeholder='First Name'></input>
						<p className='Signup_validationText'>{formErrors.fname}</p>
					</div>
					<div className='Signup_form_unit'>
						<label className='Signup_label' htmlFor='lname'>Last Name</label>
						<input className='Signup_textInput' type='text' name='lname' value={form.lname} onChange={handleFormChange} placeholder='Last Name'></input>
						<p className='Signup_validationText'>{formErrors.lname}</p>
					</div>
					<div className='Signup_form_unit--long'>
						<label className='Signup_label' htmlFor='email'>Email Address</label>
						<input className='Signup_textInput' type='email' name='email' value={form.email} onChange={handleFormChange} placeholder='Email Address'></input>
						<p className='Signup_validationText'>{formErrors.email}</p>
					</div>
					<div className='Signup_form_unit'>
						<label className='Signup_label' htmlFor='password'>Password</label>
						<input className='Signup_textInput' type='password' name='password' value={form.password} onChange={handleFormChange}></input>
						<p className='Signup_validationText'>{formErrors.password}</p>
					</div>
					<div className='Signup_form_unit'>
						<label className='Signup_label' htmlFor='confirmPassword'>Confirm Password</label>
						<input className='Signup_textInput' type='password' name='confirmPassword' value={form.confirmPassword} onChange={handleFormChange}></input>
						<p className='Signup_validationText'>{formErrors.confirmPassword}</p>
					</div>
					<button type='submit' className='Util_btnSecondary Signup_submitButton'>Sign Up</button>
				</form>
				<Link to='/login' style={{ marginBottom: '8px' }}>I already have an account</Link>
				<p className='Signup_submissionMessage'>{submissionMessage}</p>
			</div>
		</div>
	)
}