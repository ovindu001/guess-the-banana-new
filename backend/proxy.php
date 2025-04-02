<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// API URL
$url = "http://marcconrad.com/uob/banana/api.php?out=json";

// Use cURL instead of file_get_contents()
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Follow redirects
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Ignore SSL errors (for localhost testing)

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($http_code == 200 && $response) {
    $data = json_decode($response, true);

    // Ensure the API response is valid
    if (isset($data['question']) && isset($data['solution'])) {
        echo json_encode([
            "image" => $data['question'], // Corrected key
            "solution" => $data['solution']
        ]);
    } else {
        echo json_encode(["error" => "Invalid API response structure"]);
    }
} else {
    echo json_encode([
        "error" => "Failed to fetch API data",
        "http_code" => $http_code,
        "curl_error" => $curl_error
    ]);
}
?>
