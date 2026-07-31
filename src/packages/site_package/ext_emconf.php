<?php

$EM_CONF[$_EXTKEY] = [
    'title' => 'Lueg Site Package',
    'description' => 'Site package: page templates, TypoScript and assets.',
    'category' => 'templates',
    'author' => 'Studio Thompfister',
    'author_email' => 'dani@studiothompfister.com',
    'state' => 'stable',
    'version' => '1.0.0',
    'constraints' => [
        'depends' => [
            'typo3' => '14.0.0-14.99.99',
            'fluid_styled_content' => '14.0.0-14.99.99',
        ],
        'conflicts' => [],
        'suggests' => [],
    ],
];
