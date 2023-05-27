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
					<h1>What is <span className="Util_logoInText">STEREO8s</span>?</h1>
					<p>A web app that aims to pair <span className="Util_bold Util_italic">nostalgia</span> with <span className="Util_bold Util_italic">new technologies</span>. <span className="Util_logoInText">STEREO8s</span> allows users with a Spotify Premium&reg; account to create virtual 8-track "cartridges" that mimic the real 8-track experience, complete with songs sliced and distributed across the tape and hiss between tracks.</p>
				</div>
				<div className="Home_about_halfSection">
					<img loading="lazy" />
				</div>
				<div className="Home_about_halfSection">
					<img loading="lazy" />
				</div>
				<div className="Home_about_halfSection">
					<h1>Why <span className="Util_logoInText">STEREO8s</span>?</h1>
					<p>Analog audio has seen a resurgence over the last decade, but much of the enthusiasm has been led by vinyl and cassettes. Other mediums, including 8-track tapes, have largely been left behind, even though they played a unique role in the history of analog audio. This web application is <a href="https://www.anthonyvolk.com">my</a> attempt to keep their legacy alive in the digital age.</p>
				</div>
				<div className="Home_about_halfSection">
					<h1>What technology does <span className="Util_logoInText">STEREO8s</span> use?</h1>
					<p><span className="Util_logoInText">STEREO8s</span> is a full-stack web applcation. The back end, which creates, stores, and deletes users' cartridges, is a RESTful API built using NodeJS and ExpressJS, connected to a PostgreSQL database via Sequelize ORM. The front end, including most requests to Spotify's API, is a ReactJS 17 application. For more information, check out the project's <a href="https://github.com/anth-volk/8-track-using-spotify">GitHub page</a>.</p>
				</div>
				<div className="Home_about_halfSection">
					<img loading="lazy" />
				</div>
				<div className="Home_about_fullSection">
					<h1>What features does App Name have?</h1>
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