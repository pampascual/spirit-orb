export class AudioHandler {
    constructor(onTranscription) {
        this.analyser = null;
        this.isActive = false;
        this.audioContext = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.isRecording = false;
        this.onTranscription = onTranscription;
    }

    async setup() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.7;
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const source = this.audioContext.createMediaStreamSource(stream);
            source.connect(this.analyser);
            
            // Setup recording
            this.mediaRecorder = new MediaRecorder(stream);
            
            this.mediaRecorder.ondataavailable = (event) => {
                this.audioChunks.push(event.data);
            };

            this.mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                this.audioChunks = [];
                if (this.onTranscription) {
                    this.onTranscription(audioBlob);
                }
            };
            
            document.getElementById('info').textContent = 'Spirit is listening...';
            this.isActive = true;
        } catch (err) {
            console.error('Error accessing microphone:', err);
            document.getElementById('info').textContent = 'Failed to connect with the spirit';
        }
    }

    startRecording() {
        if (this.mediaRecorder && !this.isRecording) {
            this.mediaRecorder.start();
            this.isRecording = true;
        }
    }

    stopRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
            this.isRecording = false;
        }
    }

    update() {
        if (!this.isActive || !this.analyser) return 0;
        
        const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(dataArray);
        
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        return Math.pow(average / 256, 1.5);
    }
}