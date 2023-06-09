# STEREO 8s

## Overview
Welcome to the official repository of STEREO 8s, a SERN-stack web application that aims to simulate the experience of an 8-track player for users with premium Spotify subscriptions.

To report a bug or request a feature, open a new ticket at the (issues)[https://www.github.com/anth-volk/stereo-8s/issues] tab above.

## Structure
The application is divided into two parts: server and client.

The server side is a RESTful API built using Node and Express that handles both user authentication and the creation of user 8-track "cartridges," which are stored in a remote SQL database through three related tables representing each album, 8-track "program," and track. The user authentication process utilizes a pair of JSON web tokens, one for short-term authentication and one for longer-term token refreshing, hashing the refresh token and storing both in sessionStorage in order to diminish the risk of cross-site scripting and man-in-the-middle authentication attacks.

The client, meanwhile, is built using React and the Spotify API & SDK. After login, users connect to Spotify via a server-side request to Spotify's authentication process, after which the client-side SDK loads. After the user creates a simulated 8-track "cartridge," the data structure representing it is stored in the remote SQL database. Upon client-side reload, all of the user's cartridges are fetched to create their virtual "library." When a user selects their cartridge, the SDK then attempts to create a local Spotify connection, after which playback alternates between Spotify tracks (enqueued via the Spotify API) and local effect audio.

To fully simulate the 8-track experience, when users create new "cartridges," these cartridges contain one album, the content of which is fetched via the Spotify API. These albums are then broken up and redistributed algorithmically onto the "cartridge" to limit the amount of dead space on each of the cartridge's four "programs." Playback includes moments of tape hiss, as well as the sound of the program arm of the 8-track "player" changing programs.

## Known Issues
* If a user attempts to play too many Spotify tracks at once, such as by pressing the PROGRAM button too quickly, the Spotify SDK will respond with a `202 Accepted` and attempt to play back music, but nothing will play.
* If a user launches the app multiple times, the SDK will create multiple instantiations of the local player; this will be resolved in an upcoming patch.

## Limitations
* At the moment, the Spotify SDK does not work with React 18, requiring the app to be frozen at React 17 and disallowing the use of v.18's `Suspense` feature.