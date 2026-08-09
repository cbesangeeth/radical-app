import sys
from faster_whisper import WhisperModel

audio_path = sys.argv[1]

model = WhisperModel("small")

segments, _ = model.transcribe(audio_path)

full_text = ""
for segment in segments:
    full_text += segment.text + " "

print(full_text.strip())