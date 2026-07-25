<?php

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$file = __DIR__ . $path;

// Si le fichier existe réellement, le serveur PHP le renvoie directement.
if ($path !== '/' && is_file($file)) {
  return false;
}

// Sinon, la requête est transmise à Symfony.
require __DIR__ . '/index.php';