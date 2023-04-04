// External imports
import { useState } from 'react';
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
	const validationErrorObject = {
		fname: '',
		lname: '',
		email: '',
		password: '',
		confirmPassword: ''
	};

	const [form, setForm] = useState(formObject);

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

		// Store form data in new variable;
		// note that data is accessible via FIELD_NAME.value
		const formElements = event.target.elements;


		// Validate that no fields are empty


		// Validate password



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