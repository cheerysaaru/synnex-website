<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_unique(array_filter([
        env('FRONTEND_URL', 'http://127.0.0.1:3200'),
        'http://127.0.0.1:3200',
        'http://localhost:3200',
        'http://127.0.0.1:3001',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://localhost:3000',
    ]))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
