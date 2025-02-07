export class OllamaInterface {
    constructor() {
        this.baseURL = 'http://localhost:11434/api/generate';
        this.model = "llama3.2"; // or another model you prefer
    }

    async chat(message) {
        try {
            const response = await fetch(this.baseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    prompt: message,
                    stream: false
                })
            });
            
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error communicating with Ollama:', error);
            return null;
        }
    }
}