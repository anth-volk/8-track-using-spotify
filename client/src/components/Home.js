// External imports
import { Fragment } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {

	return(
		<Fragment>		
			<section className="Home_hero">
			<img className="Home_heroImage" />
			<div className="Home_heroTextContainer">
				<h1 className="Home_heroTagline">Tagline!</h1>
				<h2 className="Home_heroSubtagline">Sub-tagline (if necessary)</h2>
			</div>
			<div className="Home_heroFooter">
				<button type='button' className='Util_buttonLink'>
					<Link to='/signup'>Sign Up</Link>
				</button>
				<Link to='/login'>I already have an account</Link>
				<div className="Home_heroFooter_spotifyTag">
					<p className="Home_heroFooter_spotifyTag_text">Powered by</p>
					<img className="Home_heroFooter_spotifyLogo" />
				</div>
			</div>
		</section>
		<section className="Home_about">
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
		</section>
	</Fragment>
	)
}