// External imports
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Signup() {

	// State variable object for controlled input
	const formObject = {
		fname: '',
		lname: '',
		email: '',
		password: '',
		confirmPassword: ''
	};
	const formErrorsObject = {
		fname: '',
		lname: '',
		email: '',
		password: '',
		confirmPassword: ''
	};

	const [form, setForm] = useState(formObject);
	const [formErrors, setFormErrors] = useState(formErrorsObject);
	const [isFormSubmitted, setIsFormSubmitted] = useState(false);
	const [isFormValid, setIsFormValid] = useState(true);

	useEffect(() => {

		handleValidation();

	}, [isFormSubmitted])

	function handleValidation() {

		console.log(form);
		let isValid = true;

		// Map over form keys
		Object.keys(form)
			.map( (formElementKey) => {
				console.log(formElementKey);
				console.log(form[formElementKey]);
				console.log(!form[formElementKey]);

				if(!form[formElementKey]) {
					console.log('No input');
					setFormErrors( (prev) => ({
						...prev,
						[formElementKey]: 'No input'
					}))
				} else {
					setFormErrors( (prev) => ({
						...prev,
						[formElementKey]: ''
					}))
				}


			})
		
		/*


		Object.keys(form)
			.map( (formElementKey) => {

				// If element doesn't exist, place message in formErrors
				console.log('Form:');
				console.log(form);
				console.log('formElementKey:');
				console.log(formElementKey);
				console.log('form[formElementKey]:');
				console.log(form[formElementKey]);

				if (!form[formElementKey]) {
					console.log('Not form element key')

					setFormErrors( (prevObj) => ({
						...prevObj,
						[formElementKey]: 'This field is required'
					}));
					setIsFormValid(false);

					console.log(formErrors);

				} else {

					switch(formElementKey) {
						case 'email':
							if (!form.email.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/)) {
								setFormErrors( (prevObj) => ({
									...prevObj,
									email: 'Must input a valid email address'
								}));
								setIsFormValid(false);
							}
							break;
						case 'password':

							if (form.password !== form.confirmPassword) {
								setFormErrors( (prevObj) => ({
									...formErrors,
									password: 'Input passwords must match'
								}));
								setIsFormValid(false);
							}
							break;
					}
				}

			})
		*/




		// Old code below
		/*
		formElementsArray.map( (element) => {

			const key = element.name;
			const value = element.value;

			switch(key) {
				case 'fname':
				case 'lname':
					if (value) {
						setValidity({
							...validity,
							[key]: true
						});
					}
					break;
				case 'email':
					// Email regex taken from https://www.w3resource.com/javascript/form/email-validation.php
					const isEmailValid = value.match(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/);
					setValidity({
						...validity,
						email: isEmailValid
					});
					if (!isEmailValid) {
						setFormErrors({
							...formErrors,
							email: 'Please input a valid email address'
						});
					};
					break;
				case 'password':
					const confirmPassword = formElementsArray
						.find( (element) => {
							return element.name === 'confirmPassword'
						});
					if (value === confirmPassword.value) {
						setValidity({
							...validity,
							password: true
						});
					};
					break;
			}
		})
		*/
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
	function handleFormSubmit(event) {
		event.preventDefault();

		setIsFormSubmitted( prev => !prev);
		console.log(formErrors);

		// Pass form elements to a validation function
		// handleValidation();
		

		// TESTING
		
		// Otherwise, re-render and display warning messages


	}


	// Logic for confirming password

	return(
		<div className='Signup'>
			<div className='Signup_container'>
				<h1 className='Signup_logoText'>TEXT PLACEHOLDER</h1>
				<h2 className='Signup_title'>Sign Up</h2>
				<form className='Signup_form' onSubmit={handleFormSubmit}>
					<label htmlFor='fname'>First Name</label>
					<input className='Signup_textInput' type='text' name='fname' value={form.fname} onChange={handleFormChange} placeholder='First Name'></input>
					<label htmlFor='lname'>Last Name</label>
					<input className='Signup_textInput' type='text' name='lname' value={form.lname} onChange={handleFormChange} placeholder='Last Name'></input>
					<label htmlFor='email'>Email Address</label>
					<input className='Signup_textInput' type='email' name='email' value={form.email} onChange={handleFormChange} placeholder='Email Address'></input>
					<label htmlFor='password'>Password</label>
					<input className='Signup_textInput' type='password' name='password' value={form.password} onChange={handleFormChange}></input>
					<label htmlFor='confirmPassword'>Confirm Password</label>
					<input className='Signup_textInput' type='password' name='confirmPassword' value={form.confirmPassword} onChange={handleFormChange}></input>
					<button type='submit' className='Util_button'>Sign Up</button>
				</form>
				<Link to='/login'>I already have an account</Link>
			</div>
		</div>
	)
}