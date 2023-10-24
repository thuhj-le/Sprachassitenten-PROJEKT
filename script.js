document.addEventListener('DOMContentLoaded', () => {
    const startRecordingButton = document.getElementById('startRecording');
    const userInput = document.getElementById('userInput');
    const assistantResponse = document.getElementById('assistantResponse');
    
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;
    let silenceTimeout;
    const silenceThreshold = 10000; // 10 Sekunden Inaktivität
    
    // Erstelle Media-Recorder und definiere das Audioformat
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                
                // Sende das Audio an den Server zur Umwandlung und Antwort
                sendAudioToServer(audioBlob);
            };
        })
        .catch((error) => {
            console.error('Fehler beim Zugriff auf das Mikrofon: ', error);
        });
    
    startRecordingButton.addEventListener('click', () => {
        if (!isRecording) {
            audioChunks = [];
            isRecording = true;
            startRecordingButton.textContent = 'Aufzeichnung läuft...';
            mediaRecorder.start();
            userInput.textContent = 'Du: ';
            assistantResponse.textContent = 'Sprachassistent: ';
            startSilenceTimeout();
        } else {
            stopRecording();
        }
    });
    
    function stopRecording() {
        if (isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            startRecordingButton.textContent = 'Aufzeichnung starten';
            clearTimeout(silenceTimeout);
        }
    }
    
    function startSilenceTimeout() {
        silenceTimeout = setTimeout(() => {
            if (isRecording) {
                stopRecording();
            }
        }, silenceThreshold);
    }
    
    function sendAudioToServer(audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'audio.wav');
        
        // AJAX-Anfrage, um die Daten an den Server zu senden
        const xhr = new XMLHttpRequest();
        xhr.open('POST', './assistant.php', true);
        xhr.onload = function() {
            if (xhr.status === 200) {
                const response = xhr.responseText;
                userInput.textContent = 'Du: ' + response;
                assistantResponse.textContent = 'Sprachassistent: ' + getAssistantResponse(response);
            } else {
                console.error('Fehler beim Senden des Audios an den Server.');
            }
        };
        xhr.send(formData);
    }
    
    function getAssistantResponse(userInput) {
        switch (userInput.toLowerCase()) {
            case 'hallo':
                return 'Hallo! Wie kann ich dir helfen?';
            case 'wie gehts':
                return 'Mir geht es gut, danke! Und dir?';
            default:
                return 'Verstehe ich nicht. Bitte wiederhole deine Frage.';
        }
    }
});
