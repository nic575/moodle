<?php
require_once(__DIR__ . '/../../config.php');
// ERROR REPORTING
error_reporting(E_ALL & ~E_NOTICE);

// DATABASE SETTINGS
define('DB_HOST', 'localhost');
define('DB_NAME', 'user_mgmt');
define('DB_CHARSET', 'utf8');
define('DB_USER', 'qiktrading');
define('DB_PASSWORD', 'asdf');

// FILE PATHS
define("PATH_LIB", __DIR__ . DIRECTORY_SEPARATOR); 
?>