package service

import (
	"fmt"
	"os/exec"
	"path/filepath"
)

func Transcribe(filePath string) (string, error) {
	// absPath, _ := filepath.Abs(filePath)
	// cmd := exec.Command("python3", "scripts/transcribe.py", absPath)
	
	absAudioPath, _ := filepath.Abs(filePath)
	absScriptPath, _ := filepath.Abs("scripts/transcribe.py")
	
	cmd := exec.Command("/home/sangeeth/repo/personal/github/radical-app/audio-service/bin/python3",
	absScriptPath,
	absAudioPath)
	cmd.Dir = "/home/sangeeth/repo/personal/github/radical-app/audio-service"

	output, err := cmd.CombinedOutput() // 👈 IMPORTANT
	fmt.Println("Whisper raw output:", string(output))

	// output, err := cmd.Output()
	if err != nil {
		fmt.Println("Transcription error:", err)
		return "", err
	}

	return string(output), nil
}
