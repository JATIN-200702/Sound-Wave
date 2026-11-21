<?php
/*
 * SoundWave - server endpoint
 * Handles JSON and XML requests, playlist history and library reports.
 */

date_default_timezone_set("Asia/Kolkata");
define("LOG_FILE", __DIR__ . DIRECTORY_SEPARATOR . "playlist_log.txt");

/* ---------- Response helpers ---------- */
function sendJson($data, $status = 200)
{
    http_response_code($status);
    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode($data);
    exit;
}

function sendText($text, $status = 200)
{
    http_response_code($status);
    header("Content-Type: text/plain; charset=UTF-8");
    echo $text;
    exit;
}

/* ---------- Small utilities ---------- */
function toSeconds($duration)
{
    $parts = explode(":", (string)$duration);
    if (count($parts) !== 2) {
        return 0;
    }
    return ((int)$parts[0]) * 60 + (int)$parts[1];
}

function cleanText($value, $maxLength = 200)
{
    $value = trim((string)$value);
    $value = str_replace(["\r", "\n", "|"], " ", $value);
    return substr($value, 0, $maxLength);
}

/* ---------- Library report: arrays and iterators ---------- */
function buildLibraryReport()
{
    // Indexed array
    $genres = ["Pop", "Rock", "Jazz", "Lo-fi", "Hip-Hop"];

    // Associative array
    $member = [
        "name"    => "Demo Listener",
        "plan"    => "Premium",
        "country" => "India"
    ];

    // Multidimensional array
    $tracks = [
        ["title" => "Midnight Drive",  "artist" => "Neon Waves",            "seconds" => 225],
        ["title" => "Monsoon Mixtape", "artist" => "Desi Beats Collective", "seconds" => 242],
        ["title" => "Golden Hour",     "artist" => "Sunny Avenue",          "seconds" => 198]
    ];

    // Walk through the genres with an ArrayIterator
    $walkthrough = [];
    $iterator = new ArrayIterator($genres);
    $iterator->rewind();
    while ($iterator->valid()) {
        $walkthrough[] = [
            "position" => $iterator->key(),
            "genre"    => $iterator->current()
        ];
        $iterator->next();
    }

    $genreCount = count($genres);

    $aToZ = $genres;
    sort($aToZ);

    $zToA = $genres;
    rsort($zToA);

    $newestFirst = array_reverse($genres);

    $jazzIndex = array_search("Jazz", $genres);
    $jazzPosition = ($jazzIndex === false) ? 0 : $jazzIndex + 1;

    $afterSkip = $genres;
    $skipped = array_shift($afterSkip);

    $afterTrim = $genres;
    $trimmed = array_splice($afterTrim, 1, 2);

    return [
        "status"      => "ok",
        "member"      => $member,
        "genres"      => $genres,
        "tracks"      => $tracks,
        "walkthrough" => $walkthrough,
        "summary"     => [
            "genre_count"   => $genreCount,
            "a_to_z"        => $aToZ,
            "z_to_a"        => $zToA,
            "newest_first"  => $newestFirst,
            "jazz_position" => $jazzPosition,
            "after_skip"    => $afterSkip,
            "skipped"       => $skipped,
            "after_trim"    => $afterTrim,
            "trimmed"       => $trimmed
        ]
    ];
}

/* ---------- Playlist history: file handling ---------- */
function logPlaylist($playlist, $song)
{
    $line = date("Y-m-d H:i:s") . " | Playlist: " . $playlist . " | Song: " . $song . PHP_EOL;

    $handle = fopen(LOG_FILE, "a");
    if ($handle === false) {
        return false;
    }
    fwrite($handle, $line);
    fclose($handle);
    return true;
}

function readPlaylistLog()
{
    if (!file_exists(LOG_FILE)) {
        return ["status" => "ok", "exists" => false, "entries" => [], "characters" => 0];
    }

    $entries = [];
    $handle = fopen(LOG_FILE, "r");
    if ($handle === false) {
        sendJson(["status" => "error", "message" => "Could not open the history file."], 500);
    }
    while (($line = fgets($handle)) !== false) {
        $line = trim($line);
        if ($line !== "") {
            $entries[] = $line;
        }
    }
    fclose($handle);

    $characters = 0;
    clearstatcache();
    $size = filesize(LOG_FILE);
    if ($size > 0) {
        $handle = fopen(LOG_FILE, "r");
        $content = fread($handle, $size);
        fclose($handle);
        $characters = strlen($content);
    }

    return ["status" => "ok", "exists" => true, "entries" => $entries, "characters" => $characters];
}

/* ---------- XML requests ---------- */
function handleXml($raw)
{
    libxml_use_internal_errors(true);
    $xml = simplexml_load_string($raw);

    if ($xml === false) {
        sendJson(["status" => "error", "message" => "The XML could not be read."], 400);
    }

    sendJson([
        "status"  => "ok",
        "message" => "XML received and read successfully.",
        "root"    => $xml->getName(),
        "song"    => [
            "title"    => (string)$xml->title,
            "artist"   => (string)$xml->artist,
            "duration" => (string)$xml->duration
        ]
    ]);
}

/* ---------- POST requests ---------- */
function handlePost()
{
    $raw = file_get_contents("php://input");
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? $_SERVER["CONTENT_TYPE"] : "";

    if (stripos($contentType, "xml") !== false) {
        handleXml($raw);
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        sendJson(["status" => "error", "message" => "The request body was not valid JSON."], 400);
    }

    $type = isset($data["type"]) ? $data["type"] : "";

    switch ($type) {

        case "fixed_json":
            $song = isset($data["song"]) && is_array($data["song"]) ? $data["song"] : [];
            $duration = isset($song["duration"]) ? $song["duration"] : "0:00";
            sendJson([
                "status"           => "ok",
                "message"          => "JSON received.",
                "title"            => cleanText(isset($song["title"]) ? $song["title"] : "", 80),
                "artist"           => cleanText(isset($song["artist"]) ? $song["artist"] : "", 80),
                "duration"         => cleanText($duration, 10),
                "duration_seconds" => toSeconds($duration),
                "received_at"      => date("H:i:s")
            ]);

        case "multiple_songs":
            if (!isset($data["songs"]) || !is_array($data["songs"])) {
                sendJson(["status" => "error", "message" => "No songs were sent."], 400);
            }
            $processed = [];
            foreach ($data["songs"] as $item) {
                if (!is_array($item)) {
                    continue;
                }
                $duration = isset($item["duration"]) ? $item["duration"] : "0:00";
                $processed[] = [
                    "title"            => cleanText(isset($item["title"]) ? $item["title"] : "", 80),
                    "artist"           => cleanText(isset($item["artist"]) ? $item["artist"] : "", 80),
                    "duration"         => cleanText($duration, 10),
                    "duration_seconds" => toSeconds($duration),
                    "status"           => "queued"
                ];
            }
            sendJson(["status" => "ok", "count" => count($processed), "songs" => $processed]);

        case "feedback":
            $name   = cleanText(isset($data["name"]) ? $data["name"] : "", 60);
            $rating = (int)(isset($data["rating"]) ? $data["rating"] : 0);
            $track  = cleanText(isset($data["track"]) ? $data["track"] : "", 80);
            $review = cleanText(isset($data["review"]) ? $data["review"] : "", 500);

            if ($name === "" || $track === "" || $review === "" || $rating < 1 || $rating > 5) {
                sendText("Sorry, we could not process that feedback. Please check every field.", 400);
            }

            $stars = str_repeat("*", $rating);
            sendText(
                "Thank you, " . $name . "! Your feedback for \"" . $track . "\" was received.\n" .
                "Rating: " . $rating . "/5 (" . $stars . ")\n" .
                "Review length: " . strlen($review) . " characters.\n" .
                "Processed at " . date("H:i:s") . "."
            );

        case "playlist":
            $playlist = cleanText(isset($data["playlist"]) ? $data["playlist"] : "", 60);
            $song     = cleanText(isset($data["song"]) ? $data["song"] : "", 80);

            if ($playlist === "" || $song === "") {
                sendJson(["status" => "error", "message" => "Playlist name and song are both required."], 400);
            }
            if (!logPlaylist($playlist, $song)) {
                sendJson(["status" => "error", "message" => "Could not save to the history file. Check folder permissions."], 500);
            }
            sendJson([
                "status"      => "ok",
                "message"     => "Added \"" . $song . "\" to " . $playlist . ".",
                "file_exists" => file_exists(LOG_FILE)
            ]);

        case "clear_log":
            if (file_exists(LOG_FILE)) {
                unlink(LOG_FILE);
                sendJson(["status" => "ok", "message" => "Playlist activity cleared."]);
            }
            sendJson(["status" => "ok", "message" => "There was no activity to clear."]);

        default:
            sendJson(["status" => "error", "message" => "Unknown request type."], 400);
    }
}

/* ---------- GET requests ---------- */
function handleGet()
{
    $action = isset($_GET["action"]) ? $_GET["action"] : "health";

    switch ($action) {
        case "report":
            sendJson(buildLibraryReport());

        case "log":
            sendJson(readPlaylistLog());

        case "slow":
            sleep(5);
            sendText("This response was deliberately delayed.");

        case "error":
            sendText("Simulated server error.", 500);

        default:
            sendJson([
                "status"  => "ok",
                "service" => "SoundWave server",
                "time"    => date("c")
            ]);
    }
}

/* ---------- Entry point ---------- */
$method = $_SERVER["REQUEST_METHOD"];

if ($method === "POST") {
    handlePost();
} elseif ($method === "GET") {
    handleGet();
} else {
    sendJson(["status" => "error", "message" => "Method not allowed."], 405);
}
