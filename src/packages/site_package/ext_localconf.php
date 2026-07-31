<?php

declare(strict_types=1);

defined('TYPO3') or die();

// Register the site package RTE preset under the key "site_package".
$GLOBALS['TYPO3_CONF_VARS']['RTE']['Presets']['site_package']
    = 'EXT:site_package/Configuration/RTE/Default.yaml';
