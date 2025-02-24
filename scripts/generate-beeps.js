const fs = require('fs');
const { exec } = require('child_process');

// Install required packages
const installDependencies = async () => {
    return new Promise((resolve, reject) => {
        exec('npm install -D audiobuffer-to-wav', (error) => {
            if (error) {
                reject(error);
                return;
            }
            resolve();
        });
    });
};

// Generate beep sound data
const generateBeep = (frequency, duration, volume) => {
    const sampleRate = 44100;
    const samples = duration * sampleRate;
    const buffer = new Float32Array(samples);
    
    for (let i = 0; i < samples; i++) {
        const t = i / sampleRate;
        // Sine wave with exponential decay
        buffer[i] = Math.sin(2 * Math.PI * frequency * t) * 
                   Math.exp(-3 * t) * 
                   volume;
    }
    
    return buffer;
};

// Convert audio buffer to WAV
const saveBeep = async (name, frequency, duration, volume) => {
    const toWav = require('audiobuffer-to-wav');
    
    // Create audio buffer
    const buffer = generateBeep(frequency, duration, volume);
    const audioBuffer = {
        sampleRate: 44100,
        getChannelData: () => buffer
    };
    
    // Convert to WAV
    const wav = toWav(audioBuffer);
    
    // Save file
    fs.writeFileSync(`public/sounds/${name}.wav`, Buffer.from(wav));
    console.log(`Generated ${name}.wav`);
};

// Main function
const generateSounds = async () => {
    try {
        await installDependencies();
        
        // Generate different beeps
        await saveBeep('timer-beep', 1000, 0.1, 0.5);         // Standard beep
        await saveBeep('phase-change', 1200, 0.15, 0.6);      // Phase change beep
        await saveBeep('final-call', 800, 0.2, 0.7);          // Final call beep
        await saveBeep('complete', 1500, 0.3, 0.8);           // Completion beep
        
        console.log('All sound files generated successfully!');
    } catch (error) {
        console.error('Error generating sound files:', error);
    }
};

generateSounds(); 