# Windows Speech-to-Text using System.Speech
# Usage: powershell -File stt.ps1 <wavFilePath>
param([string]$AudioPath)

Add-Type -AssemblyName System.Speech

$recognizer = New-Object System.Speech.Recognition.SpeechRecognitionEngine
$recognizer.SetInputToWaveFile($AudioPath)

# Load dictation grammar for free-form recognition
$dictation = New-Object System.Speech.Recognition.DictationGrammar
$recognizer.LoadGrammar($dictation)

try {
    $result = $recognizer.Recognize()
    if ($result) {
        Write-Output $result.Text
    } else {
        Write-Output ""
    }
} catch {
    Write-Output ""
} finally {
    $recognizer.Dispose()
}
