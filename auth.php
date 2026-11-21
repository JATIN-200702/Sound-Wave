<?php
/*
 * SoundWave - account sign-up handler
 * Receives the sign-up form (POST), validates every field on the server
 * and shows either a success message or a list of errors.
 */

$flag = "OK";
$errors = [];
$fullname = "";
$email = "";
$phone = "";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    $flag = "NOTOK";
    $errors[] = "Please use the sign-up form to create an account.";
} else {
    $fullname = trim(isset($_POST["fullname"]) ? $_POST["fullname"] : "");
    $email    = trim(isset($_POST["email"]) ? $_POST["email"] : "");
    $phone    = trim(isset($_POST["phone"]) ? $_POST["phone"] : "");
    $password = isset($_POST["password"]) ? $_POST["password"] : "";
    $terms    = isset($_POST["terms"]) ? $_POST["terms"] : "";

    if ($fullname === "") {
        $flag = "NOTOK";
        $errors[] = "Full name is required.";
    } elseif (!preg_match("/^[A-Za-z ]+$/", $fullname)) {
        $flag = "NOTOK";
        $errors[] = "Full name may contain letters and spaces only.";
    }

    if ($email === "") {
        $flag = "NOTOK";
        $errors[] = "Email is required.";
    } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $flag = "NOTOK";
        $errors[] = "Please enter a valid email address.";
    }

    if ($phone === "") {
        $flag = "NOTOK";
        $errors[] = "Phone number is required.";
    } elseif (!preg_match("/^[0-9]{10}$/", $phone)) {
        $flag = "NOTOK";
        $errors[] = "Phone number must be exactly 10 digits.";
    }

    if ($password === "") {
        $flag = "NOTOK";
        $errors[] = "Password is required.";
    } elseif (strlen($password) < 6) {
        $flag = "NOTOK";
        $errors[] = "Password must be at least 6 characters long.";
    }

    if ($terms !== "yes") {
        $flag = "NOTOK";
        $errors[] = "You must accept the Terms and Conditions.";
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SoundWave - Account</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
  <style>
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
      background: radial-gradient(circle at 80% 0%, #17382a, #121212 60%);
    }
    .auth-card {
      width: 100%;
      max-width: 460px;
      background-color: #181818;
      border: 1px solid #2c2c2c;
      border-radius: 18px;
      padding: 36px 30px;
      text-align: center;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
    }
    .auth-card .logo-mark { margin-bottom: 14px; }
    .auth-icon {
      width: 64px;
      height: 64px;
      margin: 0 auto 14px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: 700;
    }
    .auth-icon.ok  { background-color: #11301d; color: #1db954; }
    .auth-icon.bad { background-color: #351616; color: #ff5c5c; }
    .auth-card ul { text-align: left; margin: 16px 0 24px; padding-left: 22px; color: #ff8585; }
    .auth-card li { margin-bottom: 6px; }
    .auth-details { text-align: left; background: #0e0e0e; border-radius: 10px; padding: 14px 18px; margin: 18px 0 24px; color: #d6d6d6; }
  </style>
</head>
<body>
  <div class="auth-card">
    <svg class="logo-mark" viewBox="0 0 48 48" aria-hidden="true">
      <defs>
        <linearGradient id="authGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#1ed760"/>
          <stop offset="1" stop-color="#0c8f3f"/>
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#authGrad)"/>
      <g fill="#0b0b0b">
        <rect x="9" y="19" width="4" height="10" rx="2"/><rect x="16" y="13" width="4" height="22" rx="2"/>
        <rect x="23" y="8" width="4" height="32" rx="2"/><rect x="30" y="15" width="4" height="18" rx="2"/>
        <rect x="37" y="20" width="4" height="8" rx="2"/>
      </g>
    </svg>

    <?php if ($flag === "OK"): ?>
      <div class="auth-icon ok">&#10003;</div>
      <h1>Welcome to SoundWave, <?php echo htmlspecialchars($fullname); ?>!</h1>
      <p class="muted">Your account has been created successfully.</p>
      <div class="auth-details">
        <p><strong>Email:</strong> <?php echo htmlspecialchars($email); ?></p>
        <p style="margin:0;"><strong>Phone:</strong> <?php echo htmlspecialchars($phone); ?></p>
      </div>
      <a class="btn btn-lg btn-block" href="index.html">Start listening</a>
    <?php else: ?>
      <div class="auth-icon bad">!</div>
      <h1>We couldn't create your account</h1>
      <p class="muted">Please fix the following and try again:</p>
      <ul>
        <?php foreach ($errors as $error): ?>
          <li><?php echo htmlspecialchars($error); ?></li>
        <?php endforeach; ?>
      </ul>
      <button type="button" class="btn btn-lg btn-block" onclick="history.back()">Go back</button>
    <?php endif; ?>
  </div>
</body>
</html>
