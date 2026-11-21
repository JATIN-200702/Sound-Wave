/* ==========================================================
   SoundWave - server communication (XMLHttpRequest)
   ========================================================== */

var SERVER_URL = "server.php";

/* Show a message in the connection status box (and as a toast for errors) */
function showStatus(message, type) {
  var box = document.getElementById("ajaxOutput");
  box.textContent = message;
  box.className = "ajax-output " + type;
  if (type === "err") {
    showToast(message);
  }
}

/* Reusable request helper with timeout and error handling */
function sendRequest(method, url, body, contentType, onSuccess) {
  var xhr = new XMLHttpRequest();
  xhr.open(method, url, true);
  xhr.timeout = 3000;

  showStatus("Sending " + method + " request to " + url + " ...", "info");

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      if (xhr.status == 200) {
        showStatus(method + " " + url + " completed: 200 OK", "ok");
        if (onSuccess) {
          try {
            onSuccess(xhr);
          } catch (err) {
            showStatus("Could not read the server response: " + err.message, "err");
          }
        }
      } else if (xhr.status == 404) {
        showStatus("404 Not Found: " + url + " does not exist on the server.", "err");
      } else if (xhr.status == 500) {
        showStatus("500 Server Error: the server could not complete the request.", "err");
      } else if (xhr.status != 0) {
        showStatus("Unexpected response " + xhr.status + " (" + xhr.statusText + ").", "err");
      }
    }
  };

  xhr.ontimeout = function () {
    showStatus("Request timed out after 3 seconds. The server is taking too long to respond.", "err");
  };

  xhr.onerror = function () {
    showStatus("Network error: could not reach the server. Open the site through http://localhost.", "err");
  };

  if (contentType) {
    xhr.setRequestHeader("Content-Type", contentType);
  }
  xhr.send(body || null);
}

/* ==========================================================
   Library: song list (JSON) and lyrics (XML)
   ========================================================== */
function loadSongsJSON() {
  sendRequest("GET", "data.json", null, null, function (xhr) {
    var data = JSON.parse(xhr.responseText);
    songs = data.songs;
    filterSongs();
    markActiveRow();
    showStatus("Library synced: " + songs.length + " songs loaded from the server.", "ok");
  });
}

function loadLyrics() {
  var wanted = document.getElementById("lyricsSelect").value;

  sendRequest("GET", "data.xml", null, null, function (xhr) {
    var xmlDoc = xhr.responseXML;
    if (xmlDoc === null) {
      xmlDoc = new DOMParser().parseFromString(xhr.responseText, "text/xml");
    }

    var tracks = xmlDoc.getElementsByTagName("track");
    var output = "No lyrics found for this track.";

    for (var i = 0; i < tracks.length; i++) {
      if (tracks[i].getAttribute("id") === wanted) {
        var title = tracks[i].getElementsByTagName("title")[0].textContent;
        var artist = tracks[i].getElementsByTagName("artist")[0].textContent;
        var lines = tracks[i].getElementsByTagName("line");
        var text = "";
        for (var j = 0; j < lines.length; j++) {
          text += lines[j].textContent + "\n";
        }
        output = title + " - " + artist + "\n\n" + text.trim();
        break;
      }
    }

    document.getElementById("lyricsOutput").textContent = output;
  });
}

/* ==========================================================
   Account: backups sent to the server
   ========================================================== */
function postFixedJSON() {
  var payload = {
    type: "fixed_json",
    song: { title: "Midnight Drive", artist: "Neon Waves", duration: "3:45" }
  };

  sendRequest("POST", SERVER_URL, JSON.stringify(payload), "application/json", function (xhr) {
    var reply = JSON.parse(xhr.responseText);
    document.getElementById("serverOutput").textContent = JSON.stringify(reply, null, 2);
    showToast("Track backed up as JSON.");
  });
}

function postFixedXML() {
  var xmlString = '<?xml version="1.0" encoding="UTF-8"?>' +
    "<song>" +
    "<title>Midnight Drive</title>" +
    "<artist>Neon Waves</artist>" +
    "<duration>3:45</duration>" +
    "</song>";

  sendRequest("POST", SERVER_URL, xmlString, "application/xml", function (xhr) {
    var reply = JSON.parse(xhr.responseText);
    document.getElementById("serverOutput").textContent = JSON.stringify(reply, null, 2);
    showToast("Track backed up as XML.");
  });
}

/* ==========================================================
   Home: recommendations (several JSON objects in one request)
   ========================================================== */
function postMultipleSongs() {
  var picks = [
    { title: "Neon Skyline",  artist: "Neon Waves",    duration: "3:12" },
    { title: "Chai Sutta",    artist: "Desi Beats Collective", duration: "2:48" },
    { title: "Blue Monday Jazz", artist: "Luna Jazz Trio", duration: "4:05" }
  ];

  var payload = { type: "multiple_songs", songs: picks };

  sendRequest("POST", SERVER_URL, JSON.stringify(payload), "application/json", function (xhr) {
    var reply = JSON.parse(xhr.responseText);
    var list = document.getElementById("recoList");
    list.innerHTML = "";

    for (var i = 0; i < reply.songs.length; i++) {
      var item = reply.songs[i];
      var li = document.createElement("li");
      li.className = "reco-card";
      li.innerHTML = '<img src="' + coverArt(i + 3) + '" alt="' + escapeHTML(item.title) + ' artwork">' +
        '<div><strong>' + escapeHTML(item.title) + '</strong>' +
        '<small>' + escapeHTML(item.artist) + ' &middot; ' + escapeHTML(item.duration) +
        ' (' + item.duration_seconds + ' sec)</small></div>';
      list.appendChild(li);
    }

    showToast(reply.count + " recommendations ready.");
  });
}

/* ==========================================================
   Account: connection checks
   ========================================================== */
function testMissingFile() {
  sendRequest("GET", "missing-file.json", null, null, null);
}

function testServerError() {
  sendRequest("GET", SERVER_URL + "?action=error", null, null, null);
}

function testTimeout() {
  sendRequest("GET", SERVER_URL + "?action=slow", null, null, null);
}

/* ==========================================================
   Account: feedback (dynamic user input sent as JSON)
   ========================================================== */
function submitFeedback(event) {
  event.preventDefault();

  var feedback = {
    type: "feedback",
    name: document.getElementById("fbName").value.trim(),
    rating: parseInt(document.getElementById("fbRating").value, 10),
    track: document.getElementById("fbTrack").value.trim(),
    review: document.getElementById("fbReview").value.trim()
  };

  if (feedback.name === "" || feedback.track === "" || feedback.review === "") {
    showToast("Please fill in every field.");
    return false;
  }
  if (isNaN(feedback.rating) || feedback.rating < 1 || feedback.rating > 5) {
    showToast("Rating must be between 1 and 5.");
    return false;
  }

  sendRequest("POST", SERVER_URL, JSON.stringify(feedback), "application/json", function (xhr) {
    document.getElementById("feedbackResult").textContent = xhr.responseText;
    document.getElementById("feedbackForm").reset();
    showToast("Thanks for your feedback!");
  });

  return false;
}

/* ==========================================================
   Library: playlists and activity history
   ========================================================== */
function submitPlaylist(event) {
  event.preventDefault();

  var payload = {
    type: "playlist",
    playlist: document.getElementById("plName").value.trim(),
    song: document.getElementById("plSong").value.trim()
  };

  sendRequest("POST", SERVER_URL, JSON.stringify(payload), "application/json", function (xhr) {
    var reply = JSON.parse(xhr.responseText);
    showToast(reply.message);
    document.getElementById("playlistForm").reset();
    viewPlaylistLog();
  });

  return false;
}

function viewPlaylistLog() {
  sendRequest("GET", SERVER_URL + "?action=log", null, null, function (xhr) {
    var reply = JSON.parse(xhr.responseText);
    var box = document.getElementById("playlistActivity");

    if (!reply.exists) {
      box.textContent = "No playlist activity yet. Add a song to get started.";
      return;
    }

    var html = "<h4>Recent activity (" + reply.entries.length + ")</h4><ol>";
    for (var i = 0; i < reply.entries.length; i++) {
      html += "<li>" + escapeHTML(reply.entries[i]) + "</li>";
    }
    html += "</ol><p class=\"muted small\">History file size: " + reply.characters + " characters.</p>";
    box.innerHTML = html;
  });
}

function clearPlaylistLog() {
  sendRequest("POST", SERVER_URL, JSON.stringify({ type: "clear_log" }), "application/json", function (xhr) {
    var reply = JSON.parse(xhr.responseText);
    document.getElementById("playlistActivity").textContent = reply.message;
    showToast(reply.message);
  });
}

/* ==========================================================
   Library: insights report built from server-side data
   ========================================================== */
function listToText(items) {
  return escapeHTML(items.join(", "));
}

function runLibraryReport() {
  sendRequest("GET", SERVER_URL + "?action=report", null, null, function (xhr) {
    var r = JSON.parse(xhr.responseText);
    var s = r.summary;

    var html = "<h4>Membership</h4><ul>" +
      "<li>Name: " + escapeHTML(r.member.name) + "</li>" +
      "<li>Plan: " + escapeHTML(r.member.plan) + "</li>" +
      "<li>Country: " + escapeHTML(r.member.country) + "</li></ul>";

    html += "<h4>Catalogue</h4><table><thead><tr><th>#</th><th>Track</th><th>Artist</th><th>Seconds</th></tr></thead><tbody>";
    for (var i = 0; i < r.tracks.length; i++) {
      html += "<tr><td>" + (i + 1) + "</td><td>" + escapeHTML(r.tracks[i].title) + "</td><td>" +
        escapeHTML(r.tracks[i].artist) + "</td><td>" + r.tracks[i].seconds + "</td></tr>";
    }
    html += "</tbody></table>";

    html += "<h4>Genres (" + s.genre_count + ")</h4><ul>" +
      "<li>Browse order: " + listToText(r.genres) + "</li>" +
      "<li>A to Z: " + listToText(s.a_to_z) + "</li>" +
      "<li>Z to A: " + listToText(s.z_to_a) + "</li>" +
      "<li>Newest first: " + listToText(s.newest_first) + "</li>" +
      "<li>Jazz is genre number " + s.jazz_position + " in your list</li>" +
      "<li>After skipping " + escapeHTML(s.skipped) + ": " + listToText(s.after_skip) + "</li>" +
      "<li>Featured set after trimming " + listToText(s.trimmed) + ": " + listToText(s.after_trim) + "</li></ul>";

    html += "<h4>Genre index</h4><ol start=\"0\">";
    for (var j = 0; j < r.walkthrough.length; j++) {
      html += "<li>" + escapeHTML(r.walkthrough[j].genre) + "</li>";
    }
    html += "</ol>";

    document.getElementById("libraryReport").innerHTML = html;
    showToast("Library report generated.");
  });
}

/* Load the song list from the server as soon as the page is ready */
window.addEventListener("load", loadSongsJSON);
