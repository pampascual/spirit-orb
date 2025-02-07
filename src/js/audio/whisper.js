export class WhisperTranscriber {
    constructor() {
        this.pipeline = null;
        this.isLoading = false;
    }

    async init() {
        try {
            const { pipeline } = await import('@xenova/transformers');
            this.pipeline = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
            console.log('Whisper model loaded');
        } catch (error) {
            console.error('Error loading Whisper:', error);
        }
    }

    async transcribe(audioBlob) {
        if (!this.pipeline) await this.init();
        try {
            const result = await this.pipeline(audioBlob);
            return result.text;
        } catch (error) {
            console.error('Transcription error:', error);
            return null;
        }
    }
}