function updateChordDiscoveryDisplay() {
    // Update the progress display
    const discovered = JSON.parse(localStorage.getItem('discoveredChords') || '[]');
    const progressPercentage = Math.round((discovered.length / 43) * 100);
    
    // Update progress bar and text
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    
    if (progressFill) {
        progressFill.style.width = `${progressPercentage}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${discovered.length}/43 Discovered`;
    }
    
    // Update the discovered chords grid
    // ... existing code ...
} 