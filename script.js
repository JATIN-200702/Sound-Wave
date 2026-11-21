/* ==========================================================
   SoundWave - interface script
   ========================================================== */

/* ---------- Global state ---------- */
var APP_NAME = "SoundWave";
var songs = [];
var currentIndex = 0;
var currentSongId = 1;
var toastTimer = null;
var VIEW_NAMES = ["home", "charts", "library", "play", "account"];

/* Built-in catalogue (used until the server list arrives, and as a fallback) */
var localSongs = [
  { id: 1, title: "Midnight Drive",   artist: "Neon Waves",            album: "City Lights",   duration: "3:45", genre: "Synthwave", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "Monsoon Mixtape",  artist: "Desi Beats Collective", album: "Rain Season",   duration: "4:02", genre: "Lo-fi",     src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "Golden Hour",      artist: "Sunny Avenue",          album: "Daydreams",     duration: "3:18", genre: "Pop",       src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: 4, title: "Paper Planes",     artist: "The Wanderers",         album: "Open Roads",    duration: "2:58", genre: "Rock",      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  { id: 5, title: "Velvet Rain",      artist: "Luna Jazz Trio",        album: "Blue Evenings", duration: "4:30", genre: "Jazz",      src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  { id: 6, title: "Concrete Rhythm",  artist: "MC Atlas",              album: "Street Poetry", duration: "3:36", genre: "Hip-Hop",   src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" }
];

/* ==========================================================
   Helpers
   ========================================================== */
function getAudio() {
  return document.getElementById("audioPlayer");
}

function escapeHTML(text) {
  var d = document.createElement("div");
  d.textContent = text;
  return d.innerHTML;
}

function toSeconds(duration) {
  var parts = String(duration).split(":");
  if (parts.length !== 2) {
    return 0;
  }
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

function formatTime(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }
  var m = Math.floor(totalSeconds / 60);
  var s = Math.floor(totalSeconds % 60);
  return m + ":" + (s < 10 ? "0" : "") + s;
}

function showToast(message) {
  var toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () {
    toast.classList.remove("show");
  }, 3200);
}

/* ==========================================================
   Generated album artwork (inline SVG, works offline)
   ========================================================== */
var ART_PALETTES = [
  ["#1db954", "#0b3d20"],
  ["#ff8a3d", "#6b1d00"],
  ["#ffd23f", "#7a4b00"],
  ["#4facfe", "#0a2a5c"],
  ["#a855f7", "#2b0b57"],
  ["#ff4d6d", "#4a0f1f"],
  ["#22d3ee", "#063b46"],
  ["#f472b6", "#4a1236"]
];

function coverArt(seed) {
  var palette = ART_PALETTES[seed % ART_PALETTES.length];
  var shape = seed % 4;
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="' + palette[0] + '"/>' +
    '<stop offset="1" stop-color="' + palette[1] + '"/></linearGradient></defs>' +
    '<rect width="300" height="300" fill="url(#g)"/>';

  switch (shape) {
    case 0:
      svg += '<circle cx="215" cy="88" r="52" fill="rgba(255,255,255,0.28)"/>' +
        '<path d="M0 210 Q75 170 150 210 T300 210 V300 H0Z" fill="rgba(0,0,0,0.28)"/>' +
        '<path d="M0 246 Q75 206 150 246 T300 246 V300 H0Z" fill="rgba(0,0,0,0.38)"/>';
      break;
    case 1:
      svg += '<g fill="rgba(255,255,255,0.28)">' +
        '<rect x="40" y="150" width="30" height="110" rx="8"/><rect x="85" y="90" width="30" height="170" rx="8"/>' +
        '<rect x="130" y="50" width="30" height="210" rx="8"/><rect x="175" y="110" width="30" height="150" rx="8"/>' +
        '<rect x="220" y="170" width="30" height="90" rx="8"/></g>';
      break;
    case 2:
      svg += '<g fill="none" stroke="rgba(255,255,255,0.35)" stroke-width="10">' +
        '<circle cx="150" cy="150" r="40"/><circle cx="150" cy="150" r="80"/><circle cx="150" cy="150" r="120"/></g>' +
        '<circle cx="150" cy="150" r="14" fill="rgba(255,255,255,0.7)"/>';
      break;
    default:
      svg += '<g stroke="rgba(255,255,255,0.28)" stroke-width="22">' +
        '<line x1="-20" y1="260" x2="200" y2="40"/><line x1="40" y1="320" x2="320" y2="40"/>' +
        '<line x1="120" y1="330" x2="330" y2="120"/></g>';
  }

  svg += '</svg>';
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}

function applyCovers() {
  var images = document.querySelectorAll("img[data-art]");
  for (var i = 0; i < images.length; i++) {
    images[i].src = coverArt(parseInt(images[i].getAttribute("data-art"), 10));
  }
}

/* ==========================================================
   Page load, greeting and navigation
   ========================================================== */
function getGreeting() {
  var hour = new Date().getHours();
  var text;
  if (hour < 12) {
    text = "Good morning";
  } else if (hour < 17) {
    text = "Good afternoon";
  } else {
    text = "Good evening";
  }
  return text;
}

function showWelcome() {
  var greeting = getGreeting();
  document.getElementById("greeting").textContent = greeting;
  showToast(greeting + "! Welcome to " + APP_NAME + ".");
}

function showView(name) {
  if (VIEW_NAMES.indexOf(name) === -1) {
    name = "home";
  }
  var views = document.querySelectorAll(".view");
  for (var i = 0; i < views.length; i++) {
    views[i].classList.toggle("active", views[i].id === "view-" + name);
  }
  var links = document.querySelectorAll(".nav-list a");
  for (var j = 0; j < links.length; j++) {
    links[j].classList.toggle("active", links[j].getAttribute("data-view") === name);
  }
  window.scrollTo(0, 0);
}

function currentViewName() {
  var active = document.querySelector(".view.active");
  return active ? active.id.replace("view-", "") : "home";
}

/* ==========================================================
   Song list
   ========================================================== */
function renderSongs(list) {
  var box = document.getElementById("songList");
  if (list.length === 0) {
    box.innerHTML = '<p class="empty">No songs match your search.</p>';
    return;
  }
  var html = "";
  for (var i = 0; i < list.length; i++) {
    var s = list[i];
    var activeClass = (s.id === currentSongId) ? " active" : "";
    html += '<div class="song-row' + activeClass + '" data-id="' + s.id + '"' +
      ' onmouseover="rowOver(this)" onmouseout="rowOut(this)" onclick="playSongById(' + s.id + ')">' +
      '<span class="song-num"><span class="n">' + (i + 1) + '</span>' +
      '<svg class="icon icon-sm play-ico" aria-hidden="true"><use href="#i-play"></use></svg></span>' +
      '<span class="song-main">' +
      '<img class="thumb" src="' + coverArt(s.id - 1) + '" alt="' + escapeHTML(s.album) + ' cover">' +
      '<span class="song-text"><strong>' + escapeHTML(s.title) + '</strong><small>' + escapeHTML(s.artist) + '</small></span>' +
      '</span>' +
      '<span class="song-album">' + escapeHTML(s.album) + '</span>' +
      '<span class="song-genre"><span class="chip">' + escapeHTML(s.genre) + '</span></span>' +
      '<span class="song-time">' + escapeHTML(s.duration) + '</span>' +
      '</div>';
  }
  box.innerHTML = html;
}

function markActiveRow() {
  var rows = document.querySelectorAll(".song-row");
  for (var i = 0; i < rows.length; i++) {
    rows[i].classList.toggle("active", parseInt(rows[i].getAttribute("data-id"), 10) === currentSongId);
  }
}

function filterSongs() {
  var term = document.getElementById("searchBox").value.toLowerCase().trim();
  var filtered = [];
  for (var i = 0; i < songs.length; i++) {
    if (term !== "") {
      var haystack = (songs[i].title + " " + songs[i].artist + " " + songs[i].album).toLowerCase();
      if (haystack.indexOf(term) === -1) {
        continue;
      }
    }
    filtered.push(songs[i]);
  }
  renderSongs(filtered);
  if (term !== "" && currentViewName() !== "library") {
    showView("library");
  }
}

/* Mouse hover on song rows */
function rowOver(row) {
  row.style.backgroundColor = "rgba(255, 255, 255, 0.08)";
}

function rowOut(row) {
  row.style.backgroundColor = "";
}

/* ==========================================================
   Playback
   ========================================================== */
function updateNowPlaying(song, index) {
  document.getElementById("playerTitle").textContent = song.title;
  document.getElementById("playerArtist").textContent = song.artist;
  document.getElementById("npTitle").textContent = song.title;
  document.getElementById("npArtist").textContent = song.artist;
  document.getElementById("npAlbum").textContent = song.album;
  var art = coverArt(index);
  document.getElementById("playerThumb").src = art;
  document.getElementById("npCover").src = art;
  document.getElementById("selectDemo").value = "https://soundwave.app/track/" + song.title.toLowerCase().replace(/\s+/g, "-");
}

function playSong(index) {
  if (index < 0 || index >= songs.length) {
    return;
  }
  currentIndex = index;
  currentSongId = songs[index].id;
  var audio = getAudio();
  audio.src = songs[index].src;
  updateNowPlaying(songs[index], index);
  markActiveRow();
  var promise = audio.play();
  if (promise !== undefined) {
    promise.catch(function () {
      showToast("Could not play audio. Check your internet connection.");
    });
  }
}

function playSongById(id) {
  for (var i = 0; i < songs.length; i++) {
    if (songs[i].id === id) {
      playSong(i);
      break;
    }
  }
}

function togglePlay() {
  var audio = getAudio();
  if (audio.paused) {
    var promise = audio.play();
    if (promise !== undefined) {
      promise.catch(function () {
        showToast("Could not play audio. Check your internet connection.");
      });
    }
  } else {
    audio.pause();
  }
}

function nextSong() {
  if (currentIndex < songs.length - 1) {
    playSong(currentIndex + 1);
  } else {
    playSong(0);
  }
}

function prevSong() {
  if (currentIndex > 0) {
    playSong(currentIndex - 1);
  } else {
    playSong(songs.length - 1);
  }
}

function setupAudioEvents() {
  var audio = getAudio();
  var bar = document.getElementById("playerBar");
  var icon = document.getElementById("playIcon");

  audio.addEventListener("play", function () {
    icon.setAttribute("href", "#i-pause");
    bar.classList.add("playing");
  });

  audio.addEventListener("pause", function () {
    icon.setAttribute("href", "#i-play");
    bar.classList.remove("playing");
  });

  audio.addEventListener("timeupdate", function () {
    var progress = document.getElementById("progressBar");
    if (audio.duration) {
      progress.value = (audio.currentTime / audio.duration) * 100;
      document.getElementById("timeCurrent").textContent = formatTime(audio.currentTime);
      document.getElementById("timeTotal").textContent = formatTime(audio.duration);
    }
  });

  audio.addEventListener("ended", nextSong);
}

/* ==========================================================
   Player controls and events
   ========================================================== */
function changeVolume(slider) {
  getAudio().volume = slider.value / 100;
  showToast("Volume: " + slider.value + "%");
}

function changeTheme(picker) {
  document.documentElement.style.setProperty("--accent", picker.value);
  showToast("Accent colour updated to " + picker.value);
}

function highlightSearch(box) {
  box.style.backgroundColor = "#333333";
  box.style.borderColor = "#1db954";
}

function unhighlightSearch(box) {
  box.style.backgroundColor = "";
  box.style.borderColor = "";
}

function textSelected(input) {
  var selected = input.value.substring(input.selectionStart, input.selectionEnd);
  alert("You selected: " + selected + "\n\nPress Ctrl+C to copy it.");
}

/* Keyboard shortcuts: Space plays or pauses, Escape closes the sign-up window */
document.onkeydown = function (event) {
  var tag = event.target.tagName;

  if (event.key === "Escape") {
    closeModal();
    return;
  }

  var typing = (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" ||
                tag === "BUTTON" || tag === "AUDIO" || tag === "VIDEO");
  if (typing) {
    return;
  }

  if (event.code === "Space") {
    event.preventDefault();
    togglePlay();
  }
};

/* ==========================================================
   Preferences form
   ========================================================== */
function handlePrefSubmit(event) {
  event.preventDefault();
  var form = document.getElementById("prefForm");
  var quality = document.querySelector('input[name="quality"]:checked');
  var checked = document.querySelectorAll('input[name="interest"]:checked');
  var interests = [];

  for (var i = 0; i < checked.length; i++) {
    interests.push(checked[i].value);
  }

  var html = "<h4>Preferences saved</h4><ul>" +
    "<li>Username: " + escapeHTML(form.elements["username"].value) + "</li>" +
    "<li>Email: " + escapeHTML(form.elements["email"].value) + "</li>" +
    "<li>Phone: " + escapeHTML(form.elements["phone"].value) + "</li>" +
    "<li>Streaming quality: " + escapeHTML(quality ? quality.value : "Normal") + "</li>" +
    "<li>Interests: " + (interests.length > 0 ? escapeHTML(interests.join(", ")) : "None selected") + "</li>" +
    "<li>Favourite genre: " + escapeHTML(form.elements["favGenre"].value) + "</li>" +
    "</ul>";

  document.getElementById("prefOutput").innerHTML = html;
  showToast("Preferences saved.");
  return false;
}

function handlePrefReset() {
  document.getElementById("prefOutput").textContent = "Your saved preferences will appear here.";
  showToast("Form cleared.");
  return true;
}

/* ==========================================================
   Listening stats (loops and control flow)
   ========================================================== */
function moodFor(genre) {
  var message;
  switch (genre) {
    case "Synthwave":
      message = "Night-drive energy. Perfect for late evenings.";
      break;
    case "Lo-fi":
      message = "Calm and cosy. Great for studying.";
      break;
    case "Pop":
      message = "Bright and upbeat. Time to sing along.";
      break;
    case "Rock":
      message = "High energy. Turn it up.";
      break;
    case "Jazz":
      message = "Smooth and relaxed. Dinner-party vibes.";
      break;
    case "Hip-Hop":
      message = "Rhythm-driven and confident.";
      break;
    default:
      message = "A little bit of everything.";
  }
  return message;
}

function statTile(label, value) {
  return '<div class="stat-tile"><span>' + escapeHTML(label) + '</span><strong>' + escapeHTML(String(value)) + '</strong></div>';
}

function runStats() {
  var box = document.getElementById("statsOutput");

  if (songs.length === 0) {
    box.textContent = "No songs loaded yet.";
    return;
  }

  var i;
  var totalSeconds = 0;
  for (i = 0; i < songs.length; i++) {
    totalSeconds += toSeconds(songs[i].duration);
  }

  var w = 0;
  var firstLong = "None";
  while (w < songs.length) {
    if (toSeconds(songs[w].duration) > 240) {
      firstLong = songs[w].title;
      break;
    }
    w++;
  }

  var byOthers = 0;
  for (i = 0; i < songs.length; i++) {
    if (songs[i].artist === "Neon Waves") {
      continue;
    }
    byOthers++;
  }

  var d = 0;
  var runningSum = 0;
  do {
    runningSum += toSeconds(songs[d].duration);
    d++;
  } while (d < songs.length);
  var average = Math.round(runningSum / songs.length);

  var nowPlaying = songs[currentIndex];

  box.innerHTML = '<div class="stat-grid">' +
    statTile("Tracks", songs.length) +
    statTile("Total runtime", formatTime(totalSeconds)) +
    statTile("Average length", formatTime(average)) +
    statTile("First 4+ min track", firstLong) +
    statTile("By other artists", byOthers) +
    '</div><p class="mood">Now playing ' + escapeHTML(nowPlaying.title) + ' (' + escapeHTML(nowPlaying.genre) + '): ' + escapeHTML(moodFor(nowPlaying.genre)) + '</p>';
  box.style.borderLeftColor = "var(--accent)";
}

/* ==========================================================
   Music quiz
   ========================================================== */
function calculateQuiz() {
  var answers = { q1: "6", q2: "Piano", q3: "3", q4: "Drums", q5: "Beats per minute" };
  var keys = Object.keys(answers);
  var score = 0;
  var attempted = 0;

  for (var i = 0; i < keys.length; i++) {
    var chosen = document.querySelector('input[name="' + keys[i] + '"]:checked');
    if (chosen === null) {
      continue;
    }
    attempted++;
    if (chosen.value === answers[keys[i]]) {
      score += 2;
    }
  }

  if (attempted === 0) {
    showToast("Answer at least one question first.");
    return;
  }

  var total = keys.length * 2;
  var percent = (score / total) * 100;
  var grade;

  switch (Math.floor(percent / 10)) {
    case 10:
    case 9:
      grade = "A+";
      break;
    case 8:
      grade = "A";
      break;
    case 7:
      grade = "B";
      break;
    case 6:
      grade = "C";
      break;
    case 5:
      grade = "D";
      break;
    default:
      grade = "F";
  }

  var name = document.getElementById("quizName").value.trim();
  if (name === "") {
    name = "Player";
  }
  var passed = percent >= 50;

  var box = document.getElementById("quizResult");
  box.innerHTML = '<div class="result-card">' +
    '<p><strong>' + escapeHTML(name) + '</strong></p>' +
    '<p>Score: ' + score + ' / ' + total + ' &nbsp;|&nbsp; ' + percent.toFixed(0) + '% &nbsp;|&nbsp; Grade <span class="badge">' + grade + '</span></p>' +
    '<p>Answered ' + attempted + ' of ' + keys.length + ' questions. Result: <strong>' + (passed ? "PASS" : "TRY AGAIN") + '</strong></p>' +
    '</div>';
  box.style.borderLeftColor = passed ? "#1db954" : "#ff5c5c";
  showToast(passed ? "Nice work, " + name + "!" : "Keep practising, " + name + ".");
}

/* ==========================================================
   Sign up window and validation
   ========================================================== */
function openModal() {
  document.getElementById("registerModal").classList.add("open");
  document.getElementById("fullName").focus();
}

function closeModal() {
  document.getElementById("registerModal").classList.remove("open");
}

function setError(errorId, inputId, message) {
  var errorBox = document.getElementById(errorId);
  var input = document.getElementById(inputId);
  errorBox.textContent = message;
  if (message === "") {
    input.classList.remove("input-error");
    input.classList.add("input-ok");
  } else {
    input.classList.remove("input-ok");
    input.classList.add("input-error");
  }
}

function validateRegistration() {
  var valid = true;

  var fullName = document.getElementById("fullName").value.trim();
  var email = document.getElementById("regEmail").value.trim();
  var phone = document.getElementById("regPhone").value.trim();
  var password = document.getElementById("regPassword").value;
  var terms = document.getElementById("regTerms").checked;

  var nameRegex = /^[A-Za-z ]+$/;
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var phoneRegex = /^[0-9]{10}$/;

  if (fullName === "") {
    setError("nameError", "fullName", "Full name is required.");
    valid = false;
  } else if (!nameRegex.test(fullName)) {
    setError("nameError", "fullName", "Use letters and spaces only.");
    valid = false;
  } else {
    setError("nameError", "fullName", "");
  }

  if (email === "") {
    setError("emailError", "regEmail", "Email is required.");
    valid = false;
  } else if (!emailRegex.test(email)) {
    setError("emailError", "regEmail", "Enter a valid email address.");
    valid = false;
  } else {
    setError("emailError", "regEmail", "");
  }

  if (phone === "") {
    setError("phoneError", "regPhone", "Phone number is required.");
    valid = false;
  } else if (!phoneRegex.test(phone)) {
    setError("phoneError", "regPhone", "Enter exactly 10 digits.");
    valid = false;
  } else {
    setError("phoneError", "regPhone", "");
  }

  if (password === "") {
    setError("passwordError", "regPassword", "Password is required.");
    valid = false;
  } else if (password.length < 6) {
    setError("passwordError", "regPassword", "Password must be at least 6 characters.");
    valid = false;
  } else {
    setError("passwordError", "regPassword", "");
  }

  if (!terms) {
    document.getElementById("termsError").textContent = "You must accept the terms to continue.";
    valid = false;
  } else {
    document.getElementById("termsError").textContent = "";
  }

  if (!valid) {
    showToast("Please fix the highlighted fields.");
  }
  return valid;
}

/* ==========================================================
   Start-up
   ========================================================== */
songs = localSongs.slice();
applyCovers();
renderSongs(songs);
setupAudioEvents();
getAudio().volume = 0.8;

window.addEventListener("hashchange", function () {
  showView(window.location.hash.replace("#", ""));
});
showView(window.location.hash.replace("#", ""));

/* The search box is auto-focused before this script loads, so apply its highlight now */
var searchBoxEl = document.getElementById("searchBox");
if (document.activeElement === searchBoxEl) {
  highlightSearch(searchBoxEl);
}
