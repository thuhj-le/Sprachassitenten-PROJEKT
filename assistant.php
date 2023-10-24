header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $audio = $_FILES['audio'];
    
    if ($audio['error'] === UPLOAD_ERR_OK && $audio['type'] === 'audio/wav') {
        // Speichere das empfangene Audio temporär
        $tempAudioFile = 'temp_audio.wav';
        move_uploaded_file($audio['tmp_name'], $tempAudioFile);
        
        // Whisper lokal aufrufen
        exec('/Users/abdalazizelazzati/whisper -t "temp_audio.wav" -o "output.txt"');
        
        // Lese den umgewandelten Text aus der Datei aus
        $convertedText = file_get_contents('output.txt');
        
        // Gib den umgewandelten Text zurück
        echo $convertedText;
    } else {
        echo 'Fehler beim Verarbeiten des Audios.';
    }
}
?>
