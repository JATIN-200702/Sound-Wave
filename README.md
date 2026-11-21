SoundWave – Web Music Player
A Web Technology Mini Project
Project type: Front-end website with PHP-based server communication
Platform: Windows, XAMPP, Apache, and a modern web browser
1. Project Overview
SoundWave is a Spotify-inspired music player website developed as an educational Web Technology project. It demonstrates how HTML, CSS, JavaScript, AJAX, JSON, XML, and PHP can be used together to build an interactive website.

The project provides a music-streaming-style interface where users can browse a sample music catalogue, search for tracks, play audio, view lyrics, create playlist entries, submit feedback, explore library statistics, and test communication between the browser and a PHP server.

The project is intended to demonstrate the concepts covered in the Web Technology practical syllabus. It is a learning prototype, not a production music-streaming service.
2. Objectives
The main objectives of SoundWave are to:
1. Create a structured webpage using HTML5 elements.
2. Apply CSS styling, the CSS box model, Flexbox, hover effects, and animations.
3. Use JavaScript for DOM manipulation, control flow, form validation, and event handling.
4. Demonstrate asynchronous communication using XMLHttpRequest and AJAX.
5. Exchange data between the browser and server using JSON and XML.
6. Process GET and POST requests using PHP.
7. Demonstrate PHP arrays, iterators, built-in array functions, and file handling.
8. Validate form submissions on both the client side and server side.
3. Technologies Used
Technology	Role in the project
HTML5	Defines the webpage structure, forms, media elements, and semantic sections.
CSS3	Controls layout, colours, typography, spacing, responsiveness, transitions, and animations.
JavaScript	Implements interactive behaviour, music-player controls, DOM updates, validation, and event handling.
AJAX	Allows the browser to communicate with the PHP server without reloading the complete page.
XMLHttpRequest	Sends asynchronous HTTP GET and POST requests.
JSON	Stores the sample song catalogue and transfers structured data between JavaScript and PHP.
XML	Stores sample song lyrics and demonstrates XML parsing and processing.
PHP	Handles server-side requests, validation, JSON/XML processing, reports, and playlist history.
XAMPP / Apache	Provides the local web server required to execute PHP files.


4. Project File Structure
Place all eight project files together in one folder inside XAMPP's htdocs directory.
spotify-clone/
│
├── index.html       # Main webpage and user interface
├── style.css        # Main stylesheet and visual design
├── script.js        # Front-end JavaScript functionality
├── ajax_player.js   # AJAX requests and server communication
├── server.php       # PHP endpoint for GET and POST requests
├── auth.php         # Server-side registration form validation
├── data.json        # Sample song catalogue in JSON format
└── data.xml         # Sample song lyrics in XML format
Runtime-generated file: server.php creates playlist_log.txt in the project directory when playlist activity is saved. This file may not exist until the first playlist entry is submitted.
Purpose of each file
index.html
Contains the main SoundWave interface, navigation, song sections, charts, library, forms, audio and video elements, player controls, and sign-up modal. It loads the CSS and JavaScript files.
style.css
Contains the main visual styling, including colours, typography, layout, cards, navigation, buttons, responsive rules, hover effects, transitions, and animations.
script.js
Contains browser-side functionality such as:
- Displaying a welcome message.
- Switching between website views.
- Rendering and filtering songs.
- Updating the now-playing information.
- Controlling audio playback.
- Handling keyboard shortcuts and audio events.
- Calculating library statistics.
- Processing the quiz and preferences form.
- Validating registration fields before submission.
ajax_player.js
Contains the reusable AJAX request function and functions for:
- Loading songs from data.json.
- Loading and parsing lyrics from data.xml.
- Sending JSON and XML data to PHP.
- Sending multiple song objects in one request.
- Submitting feedback.
- Submitting playlist information.
- Viewing and clearing playlist activity.
- Generating a library report.
- Testing missing-file, server-error, and timeout handling.
server.php
Acts as the PHP server endpoint. It:
- Handles GET and POST requests.
- Reads JSON request bodies.
- Reads and processes XML request bodies.
- Returns JSON or text responses.
- Processes song and feedback data.
- Saves and reads playlist history.
- Generates a library report using PHP arrays and iterators.
- Demonstrates PHP file-handling functions.
auth.php
Receives the registration form through POST and validates the submitted name, email, phone number, password, and terms acceptance. It displays a success page or validation errors.
data.json
Contains a sample catalogue of six tracks. Each song has an ID, title, artist, album, duration, genre, and audio source URL.
data.xml
Contains sample lyrics for the six tracks. Each track has an ID, title, artist, and multiple lyric lines.
5. Main Website Features
5.1 Home page and navigation
- Sidebar navigation for Home, Top Charts, Your Library, Play & Learn, and Account.
- Header search field.
- Welcome message.
- Featured music section.
- Album and artist information.
- Navigation between website views.
5.2 Music player
- HTML5 audio player.
- Play and pause controls.
- Previous and next track controls.
- Current track title, artist, and album information.
- Current playback time and total duration.
- Playback progress bar.
- Volume control.
- Track search and filtering.
- Audio events such as play, pause, timeupdate, and ended.
The sample audio files are loaded from external SoundHelix URLs, so an internet connection may be required for playback.
5.3 Top charts and music catalogue
- Displays sample tracks with their title, artist, album, genre, and duration.
- Uses JavaScript to render song rows dynamically.
- Allows users to search for songs or artists.
5.4 Lyrics section
- Reads lyrics from data.xml.
- Uses AJAX to request the XML file.
- Parses XML using the browser's XML document support and DOMParser fallback.
- Displays the lyrics of the selected track.
5.5 Playlist handling
- Accepts a playlist name and song name.
- Sends the information to server.php using an AJAX POST request.
- PHP validates the submitted values.
- PHP appends playlist activity to playlist_log.txt.
- Users can view and clear the playlist activity.
5.6 User preferences
- Collects username, email, phone number, streaming quality, interests, and favourite genre.
- Demonstrates HTML form controls and validation attributes.
- Uses JavaScript to process the form and display the submitted preferences.
- Includes a reset button and reset-event handling.
5.7 Feedback form
- Collects the user's name, rating, track name, and review.
- Sends the values to the PHP server using AJAX and JSON.
- PHP validates the submitted data and returns a response.
- The response is displayed on the webpage.
5.8 Registration form
- Collects full name, email, phone number, password, and terms acceptance.
- Performs JavaScript validation before submission.
- Sends the form to auth.php using the POST method.
- PHP performs server-side validation and displays the result.
5.9 Library report and statistics
- Calculates sample library statistics using JavaScript.
- Generates a PHP library report using a GET request.
- Demonstrates PHP indexed, associative, and multidimensional arrays.
- Demonstrates ArrayIterator and built-in array functions.
5.10 Error handling demonstration
The project includes test functions for:
- A missing resource (404 response).
- A simulated server error (500 response).
- A delayed response that triggers the AJAX timeout.
- Network errors and unexpected HTTP responses.
6. AJAX and Server Communication
AJAX is used to exchange information between the browser and PHP without refreshing the entire webpage.

The reusable request helper is defined in ajax_player.js:
function sendRequest(method, url, body, contentType, onSuccess) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.timeout = 3000;
    // Request and response handling
}
The project uses the following request examples:
Operation	HTTP method	Resource
Load song catalogue	GET	data.json
Load song lyrics	GET	data.xml
Get server health response	GET	server.php
Generate library report	GET	server.php?action=report
Read playlist history	GET	server.php?action=log
Send a sample JSON song	POST	server.php
Send multiple song objects	POST	server.php
Send XML song information	POST	server.php
Submit feedback	POST	server.php
Save playlist activity	POST	server.php
Clear playlist history	POST	server.php


JSON request example
{
  "type": "multiple_songs",
  "songs": [
    {
      "title": "Midnight Drive",
      "artist": "Neon Waves",
      "duration": "3:45"
    },
    {
      "title": "Golden Hour",
      "artist": "Sunny Avenue",
      "duration": "3:18"
    }
  ]
}
JavaScript converts the object into a JSON string using JSON.stringify(). PHP reads the request body, decodes it using json_decode(), processes the song objects, and returns a JSON response using json_encode().
XML processing
The project demonstrates two XML operations:
1. The browser retrieves data.xml and parses the track and lyric elements.
2. JavaScript can send an XML request body to server.php, where PHP processes it using simplexml_load_string().
7. PHP Concepts Demonstrated
The server.php file includes examples of:
Arrays
- Indexed arrays.
- Associative arrays.
- Multidimensional arrays.
Loops and iterators
- foreach for processing song entries.
- while for reading playlist history and traversing an iterator.
- ArrayIterator methods such as rewind(), valid(), key(), current(), and next().
Built-in array functions
- count()
- sort()
- rsort()
- array_reverse()
- array_search()
- array_shift()
- array_splice()
File handling
- fopen() to open files.
- fwrite() to write playlist history.
- fgets() to read lines.
- fread() to read file contents.
- fclose() to close files.
- file_exists() to check file existence.
- filesize() to get file size.
- unlink() to delete the playlist history file.
8. Web Technology Syllabus Mapping
The following table maps the project files and implemented examples to the 15 experiments in the Web Technology practical syllabus.
No.	Syllabus experiment	Relevant project files and examples
1	Basic HTML Page Structure	index.html – headings, paragraphs, images, lists, tables, and links.
2	Forms in HTML	index.html – text, email, password, checkbox, radio, dropdown, textarea, submit, and reset controls.
3	HTML5 Semantic Elements and New Attributes	index.html – semantic elements, required, placeholder, autofocus, pattern, email input, <progress>, and <meter>.
4	Basic CSS Styling	style.css and internal/inline CSS in index.html.
5	CSS Box Model and Flexbox	style.css – spacing, borders, padding, margins, and Flexbox layouts.
6	Hover Effects and Animations	style.css and internal CSS in index.html – hover states, transitions, transforms, keyframes, and shimmer/equalizer effects.
7	JavaScript Basics and DOM Manipulation	script.js – loops, conditions, switch, break, continue, DOM selection, and dynamic content updates.
8	Form Validation using JavaScript	script.js – validateRegistration() and preference/feedback form handling.
9	Event Handling in JavaScript	index.html and script.js – click, load, reset, submit, change, select, focus, blur, mouse, and keyboard events.
10	Understanding GET and POST AJAX Methods	ajax_player.js and server.php – asynchronous GET and POST requests.
11	Sending Multiple JSON Objects via AJAX	ajax_player.js – postMultipleSongs(); server.php – multiple_songs request handling.
12	Using XMLHttpRequest with Error Handling	ajax_player.js – sendRequest(), status handling, network errors, and timeout handling.
13	Dynamic User Input with JSON in AJAX Requests	ajax_player.js – playlist and feedback submission; server.php – JSON decoding and processing.
14	Basic PHP Programs	server.php – arrays, loops, iterators, built-in array functions, and file handling.
15	Form Handling using PHP	auth.php – POST form processing and server-side validation.


9. Installation and Setup Using XAMPP
Requirements
- Windows computer.
- XAMPP installed.
- Apache module.
- Modern web browser such as Google Chrome.
- Internet connection for externally hosted fonts, sample audio, and sample video.
Step 1: Copy the project
Copy the complete spotify-clone folder into:
C:\xampp\htdocs\
The resulting location should be:
C:\xampp\htdocs\spotify-clone\
All eight project files should be directly inside this folder.
Step 2: Start Apache
1. Open XAMPP Control Panel.
2. Start the Apache module.
3. Wait until Apache shows a running status.
Port configuration used in this setup: Apache HTTP port is 8080 because the default port 80 was occupied on the computer. The Apache SSL port was configured as 4433.

If Apache is configured to use port 8080, use the following project URL.
Step 3: Open the website
http://localhost:8080/spotify-clone/
You can also open the main page directly:
http://localhost:8080/spotify-clone/index.html
Do not open the PHP files directly from File Explorer. PHP must be executed through Apache using localhost.
Step 4: Check the PHP server endpoint
Open:
http://localhost:8080/spotify-clone/server.php
A successful GET request should return a JSON health response containing the service name and server time.
10. How to Demonstrate the Project
The following sequence can be used during a practical demonstration:
1. Open the SoundWave home page and explain the HTML structure and navigation.
2. Demonstrate the search field and search for a song or artist.
3. Play a track and show the player controls, volume, and progress bar.
4. Open Top Charts and explain the dynamically displayed song information.
5. Open Your Library and load the song catalogue from data.json.
6. Select a track and load its lyrics from data.xml.
7. Enter a playlist name and song, submit it, and explain the AJAX POST request.
8. View playlist activity and explain PHP file handling.
9. Generate the library report and explain PHP arrays and ArrayIterator.
10. Open Play & Learn and demonstrate the statistics and quiz.
11. Open Account and demonstrate the preferences form and reset operation.
12. Submit feedback and explain how JSON is sent to the PHP server.
13. Open the sign-up form and demonstrate client-side and server-side validation.
14. Demonstrate the missing-file, server-error, and timeout tests.
11. Testing Checklist
Test	Expected result
Open the project URL	SoundWave home page loads.
Search for a song	Matching songs are displayed.
Play a track	Audio starts if the external audio source is available.
Load song catalogue	Song data is retrieved from data.json.
Load lyrics	Selected track lyrics are displayed from data.xml.
Submit a valid playlist	PHP confirms the playlist entry and writes to the log file.
View playlist history	Previously recorded entries are displayed.
Generate library report	PHP returns catalogue and array information.
Submit valid feedback	Server returns a feedback confirmation.
Submit invalid registration	PHP displays validation errors.
Test missing resource	An HTTP 404 error is handled.
Test server error	An HTTP 500 error is handled.
Test delayed request	AJAX timeout message is displayed.


12. Limitations and Future Improvements
This project is an educational prototype. The following limitations should be considered:
1. No database integration: The project does not use MySQL or another database. Playlist activity is stored in a text file.
2. Registration is not persistent: auth.php validates the submitted registration information and displays a result, but does not create a stored user account.
3. No real authentication system: Login sessions, password hashing, account management, and secure authentication are not implemented.
4. Sample music catalogue: The project contains six sample tracks rather than a large live music catalogue.
5. External media sources: Audio, video, and web fonts depend on externally hosted resources and may require internet access.
6. No production streaming infrastructure: The project does not include a streaming service backend, licensing system, or content delivery network.
Possible future enhancements
- Add MySQL database integration.
- Implement secure user registration and login.
- Hash passwords using PHP's password_hash() and verify them securely.
- Store playlists and user preferences in a database.
- Add more songs and genre-based filtering.
- Add user-specific playlists and favourites.
- Improve accessibility and mobile responsiveness.
- Add server-side security controls and stronger input validation.
13. Conclusion
SoundWave demonstrates the integration of front-end and back-end web technologies in one educational project. It uses HTML5 to structure the website, CSS3 to design the interface, JavaScript to provide interactive functionality, AJAX to exchange data asynchronously, JSON and XML to represent structured information, and PHP to process server requests and forms.

The project covers practical examples from all 15 experiments in the Web Technology syllabus and provides a single application in which these concepts can be demonstrated and explained.
Project Name: SoundWave – Web Music Player
Project Category: Web Technology
Execution Environment: XAMPP / Apache on localhost
Main Entry File: index.html
Server Endpoint: server.php
Registration Handler: auth.php
