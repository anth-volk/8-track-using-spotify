
export default function Signup() {

	return(
		<div className='Signup'>
			<div className='Signup_container'>
				<h1 className='Signup_logoText'>TEXT PLACEHOLDER</h1>
				<h2 className='Signup_title'>Sign Up</h2>
				<form action='/signup' method='post' className='Signup_form'>
					<label for='fname'>First Name</label>
					<input className='Signup_textInput' type='text' name='fname' placeholder='First Name'></input>
					<label for='lname'>Last Name</label>
					<input className='Signup_textInput' type='text' name='lname' placeholder='Last Name'></input>
					<label for='email'>Email Address</label>
					<input className='Signup_textInput' type='email' name='email' placeholder='Email Address'></input>
				</form>
			</div>
		</div>
	)
}