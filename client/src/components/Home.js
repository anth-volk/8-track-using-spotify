// External imports
import { Fragment } from 'react';
import { Link } from 'react-router-dom';

// File imports
import heroTapes from '../images/hero_tapes.jpg';
import spotifyLogo from '../images/spotify_logo_white.png';

// Style imports
import '../styles/Home.css';

export default function Home() {

	const linkStyle = {
		color: 'inherit',
		textDecoration: 'inherit'
	};

	return (
		<section className="Home">
			<div className="Home_hero">
				<img className="Home_heroImage" src={heroTapes} alt="Stack of 8-track tapes, with Kenny Rogers's album 'The Gambler' displayed beside" />
				<div className="Home_heroTextContainer">
					<h1 className="Home_heroTagline">Analog Memories.</h1>
					<h1 className="Home_heroTagline">Digital Innovation.</h1>
					<h2 className="Home_heroSubtagline">Simulate the 8-track experience with <span className="Util_logoInText">STEREO8s</span></h2>
				</div>
				<div className="Home_heroFooter">
					<button type='button' className='Util_btnAccent Home_heroButton'>
						<Link to='/signup' style={linkStyle}>Create an Account</Link>
					</button>
					<div className="Home_heroFooter_spotifyTag">
						<small className="Home_heroFooter_spotifyTag_text">Powered by</small>
						<img className="Home_heroFooter_spotifyLogo" src={spotifyLogo} />
					</div>
				</div>
			</div>
			<div className="Home_about">
				<div className="Home_about_halfSection">
					<h2>What is App Name?</h2>
					<p>Lorem Ipsum</p>
				</div>
				<div className="Home_about_halfSection">
					<img />
				</div>
				<div className="Home_about_halfSection">
					<h2>Why App Name?</h2>
					<p>Lorem Ipsum</p>
				</div>
				<div className="Home_about_fullSection">
					<h2>What features does App Name have?</h2>
				</div>
				<div className="Home_about_fullSection">
					<div className="Home_about_features">
						<div className="Home_about_featuresCard">
							<img />
							<p className="Home_about_featuresCard_text">Connect directly with Spotify</p>
						</div>
						<div className="Home_about_featuresCard">
							<img />
							<p className="Home_about_featuresCard_text">Create custom virtual 8-track tapes</p>
						</div>
						<div className="Home_about_featuresCard">
							<img />
							<p className="Home_about_featuresCard_text">Collect virtual tapes in your personal library</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}