/**
 * Chord Discovery App - Main JavaScript
 * Find and identify 43 fundamental chord types
 */

// DOM Elements object to hold references to DOM elements
const domElements = {
    identifyBtn: null,
    chordResult: null,
    resultNotes: null,
    resultType: null,
    resultName: null,
    progressFill: null,
    progressText: null,
    discoveredChordsContainer: null, // will be set in initialize
    discoveryBadge: null,
    resetBtn: null
};

// Audio context for playing chord sounds
let audioContext = null;

// Initialize the audio context (must be done after user interaction)
function initAudioContext() {
    if (audioContext === null) {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            console.log('Audio context initialized');
        } catch (e) {
            console.error('Web Audio API not supported in this browser:', e);
        }
    }
    
    // If context is suspended (browser policy), resume it
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

// Convert note name to frequency
function noteToFrequency(note) {
    const noteMap = {
        'C': 261.63, 'C#': 277.18, 'Db': 277.18, 'D': 293.66, 'D#': 311.13, 
        'Eb': 311.13, 'E': 329.63, 'F': 349.23, 'F#': 369.99, 'Gb': 369.99, 
        'G': 392.00, 'G#': 415.30, 'Ab': 415.30, 'A': 440.00, 'A#': 466.16, 
        'Bb': 466.16, 'B': 493.88
    };
    
    return noteMap[note] || 440; // Default to A4 if note not found
}

// Play a piano-like note with proper envelope
function playNote(note, startTime, duration) {
    if (!audioContext) return;
    
    const osc = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    const panNode = audioContext.createStereoPanner();
    
    // Create a more complex, softer tone using multiple oscillators
    osc.type = 'sine'; // Sine wave as the base for a softer sound
    osc.frequency.value = noteToFrequency(note);
    
    // Very slight random detune for more natural sound without harshness
    osc.detune.value = Math.random() * 2 - 1;
    
    // Create subtle stereo panning based on note frequency
    // Higher notes slightly right, lower notes slightly left
    const normalizedFreq = (osc.frequency.value - 261.63) / (493.88 - 261.63); // Normalize between C4 and B4
    panNode.pan.value = (normalizedFreq - 0.5) * 0.4; // Scale to subtle panning (-0.2 to 0.2)
    
    // Envelope for a softer, gentler piano-like sound
    // Softer attack
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.03); // Lower peak, slower attack
    
    // Gentler decay and sustain
    gainNode.gain.linearRampToValueAtTime(0.35, startTime + 0.08);
    gainNode.gain.exponentialRampToValueAtTime(0.25, startTime + 0.3);
    
    // Longer, smoother release for a more gentle fade
    gainNode.gain.setValueAtTime(0.25, startTime + duration - 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration + 0.1);
    
    // Connect nodes: oscillator -> gain -> pan -> destination
    osc.connect(gainNode);
    gainNode.connect(panNode);
    panNode.connect(audioContext.destination);
    
    // Start and stop the oscillator
    osc.start(startTime);
    osc.stop(startTime + duration + 0.1); // Add a little extra time for release
    
    // Clean up
    setTimeout(() => {
        osc.disconnect();
        gainNode.disconnect();
        panNode.disconnect();
    }, (startTime + duration + 0.1 - audioContext.currentTime) * 1000);
}

// Play a chord with slight arpeggiation for a more musical feel
function playChord(notes) {
    if (!audioContext) initAudioContext();
    if (!audioContext) return; // Exit if audio context failed to initialize
    
    const now = audioContext.currentTime;
    const noteDuration = 1.5; // Note duration in seconds
    const arpeggiationSpeed = 0.02; // Time between notes for subtle arpeggiation
    

    // Add a low-pass filter for a mellower sound
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2200; // Cut higher frequencies for less harshness
    filter.Q.value = 0.5; // Gentle slope
    filter.connect(audioContext.destination);
    
    // Play each note with slight delay for a pleasing arpeggiation effect
    notes.forEach((note, index) => {
        // Slightly longer duration for bass notes to create a warmer sound
        const noteDur = noteDuration - (index * 0.05); // Bass notes last longer
        playNote(note, now + (index * arpeggiationSpeed), noteDur);
    });
    
    // Disconnect filter after chord finishes
    setTimeout(() => {
        filter.disconnect();
    }, noteDuration * 1000 + 300);
    

}

// Track newly discovered chords
let newlyDiscoveredChords = [];
let lastDiscoveredChord = null;

// Global variable to store chord mappings
let chordMappings = {};

/**
 * Load the chord mappings from chord_mapping.txt
 */
async function loadChordMappings() {
    try {
        let text;
        
        try {
            // First try to load via fetch (works when served from web server)
            const response = await fetch('chord_mapping.txt');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            text = await response.text();
            console.log("Successfully loaded chord mappings using fetch");
        } catch (fetchError) {
            console.warn("Fetch failed:", fetchError);
            
            // If we fail to load via fetch, check if we've already loaded the mappings
            if (Object.keys(chordMappings).length > 0) {
                console.log("Using previously loaded chord mappings");
                return;
            }
            
            // Simple hard-coded mappings for a few common chords as fallback
            console.log("Using hardcoded mappings as fallback");
            
            const mappings = [
                { notes: ["C", "E", "G", "B"], name: "C Maj7", type: "Maj7" },
                { notes: ["C", "Eb", "G", "Bb"], name: "C -7", type: "-7" },
                { notes: ["C", "E", "G", "Bb"], name: "C 7", type: "7" },
                { notes: ["C", "C#", "D", "D#"], name: "C Cluster", type: "Cluster" }
            ];
            
            // Add these mappings to our global object
            for (const mapping of mappings) {
                const key = [...mapping.notes].sort().join(',');
                chordMappings[key] = {
                    name: mapping.name,
                    rootPosition: mapping.notes,
                    type: mapping.type
                };
            }
            
            console.log(`Created ${Object.keys(chordMappings).length} hardcoded chord mappings as fallback`);
            return;
        }
        
        // Parse the text file
        const lines = text.split('\n');
        let currentCombination = null;
        let chordName = null;
        let rootPosition = null;
        let chordType = null;
        
        // Clear existing mappings
        chordMappings = {};
        
        let inOriginalFormatSection = false;
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
            // Detect the start of the ORIGINAL FORMAT section
            if (trimmedLine.startsWith('# ORIGINAL FORMAT')) {
                inOriginalFormatSection = true;
                continue;
            }
            // If we're in the original format section, parse lines like 'C Cluster: C, C#, D, D#'
            if (inOriginalFormatSection && /^([A-G][#b]? .+?):\s*([A-G][#b]?(,\s*[A-G][#b]?)+)$/.test(trimmedLine)) {
                // e.g. 'C Cluster: C, C#, D, D#'
                const [full, name, notesStr] = trimmedLine.match(/^([^:]+):\s*(.+)$/);
                const notes = notesStr.split(',').map(n => n.trim());
                const key = [...notes].sort().join(',');
                chordMappings[key] = {
                    name: name.trim(),
                    rootPosition: notes,
                    type: name.trim()
                };
                continue;
            }
            
            if (trimmedLine.startsWith('Combination')) {
                // Start of a new combination
                const parts = trimmedLine.split(':');
                if (parts.length > 1) {
                    currentCombination = parts[1].trim();
                }
            } else if (trimmedLine.startsWith('Chord Name:')) {
                chordName = trimmedLine.replace('Chord Name:', '').trim();
            } else if (trimmedLine.startsWith('Root Position:')) {
                rootPosition = trimmedLine.replace('Root Position:', '').trim();
            } else if (trimmedLine.startsWith('Chord Type:')) {
                chordType = trimmedLine.replace('Chord Type:', '').trim();
                
                // If we have all the data, store this mapping
                if (currentCombination && chordName && rootPosition && chordType) {
                    // Normalize the combination (sort notes alphabetically)
                    const notes = currentCombination.split(',').map(n => n.trim());
                    const normalizedNotes = [...notes].sort();
                    const key = normalizedNotes.join(',');
                    
                    // Store the mapping with the root position
                    chordMappings[key] = {
                        name: chordName,
                        rootPosition: rootPosition.split(',').map(n => n.trim()),
                        type: chordType
                    };
                    
                    console.log(`Added mapping for ${key}:`, chordMappings[key]);
                    
                    // Reset for next combination
                    currentCombination = null;
                    chordName = null;
                    rootPosition = null;
                    chordType = null;
                }
            }
        }
        
        console.log(`Loaded ${Object.keys(chordMappings).length} chord mappings from file`);
        
        // Verify a few mappings to ensure they loaded correctly
        const sampleKeys = Object.keys(chordMappings).slice(0, 3);
        sampleKeys.forEach(key => {
            console.log(`Sample mapping for ${key}:`, chordMappings[key]);
        });
        
    } catch (error) {
        console.error('Error loading chord mappings:', error);
        
        // Add a few basic mappings so the app isn't completely broken
        const basicMappings = [
            { notes: ["C", "E", "G", "B"], name: "C Maj7", type: "Maj7" },
            { notes: ["C", "Eb", "G", "Bb"], name: "C -7", type: "-7" }
        ];
        
        for (const mapping of basicMappings) {
            const key = [...mapping.notes].sort().join(',');
            chordMappings[key] = {
                name: mapping.name,
                rootPosition: mapping.notes,
                type: mapping.type
            };
        }
    }
}

/**
 * Convert a note name to a MIDI value (0-11 for C-B)
 */
function noteToMidi(noteName) {
    // For notes with /
    if (noteName.includes('/')) {
        // Take the first option (e.g., "C#/Db" becomes "C#")
        noteName = noteName.split('/')[0];
    }
    
    // Normalize the note name
    const noteParts = noteName.match(/^([A-G])([#b]*)$/);
    if (!noteParts) {
        console.error(`Invalid note name: ${noteName}`);
        return -1;
    }
    
    const [_, baseNote, accidental] = noteParts;
    
    // Base MIDI values for C-B
    const baseValues = {
        'C': 0,
        'D': 2,
        'E': 4,
        'F': 5,
        'G': 7,
        'A': 9,
        'B': 11
    };
    
    // Calculate the MIDI value
    let midiValue = baseValues[baseNote];
    
    // Apply accidentals
    if (accidental) {
        // Handle double flats and double sharps
        if (accidental === 'bb') midiValue -= 2;
        else if (accidental === '##') midiValue += 2;
        // Handle single flats and sharps
        else {
            for (const acc of accidental) {
                if (acc === '#') midiValue++;
                else if (acc === 'b') midiValue--;
            }
        }
    }
    
    // Ensure the result is in the range 0-11
    return ((midiValue % 12) + 12) % 12;
}

/**
 * Convert a MIDI value to a note name, preferring sharps
 */
function midiToNoteName(midiValue) {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    return noteNames[((midiValue % 12) + 12) % 12];
}

/**
 * Get all inversions of a chord
 */
function getAllInversions(chord) {
    const inversions = [];
    // For each possible starting note
    for (let i = 0; i < chord.length; i++) {
        // Get the inversion starting with note at position i
        const inversion = [...chord.slice(i), ...chord.slice(0, i)];
        inversions.push(inversion);
    }
    return inversions;
}

/**
 * Get intervals from a root note
 */
function getIntervalsFromRoot(midiValues, rootIndex) {
    const rootNote = midiValues[rootIndex];
    // Calculate intervals relative to the root note
    return midiValues.map(note => (note - rootNote + 12) % 12);
}

/**
 * Normalize a chord to its canonical form
 */
function normalizeChord(midiValues) {
    // For each note as a potential root, get intervals
    const allSortedIntervals = [];
    
    for (let i = 0; i < midiValues.length; i++) {
        const intervals = getIntervalsFromRoot(midiValues, i);
        const sortedIntervals = [...intervals].sort((a, b) => a - b);
        allSortedIntervals.push(sortedIntervals);
    }
    
    // Find the lexicographically smallest interval set
    return allSortedIntervals.sort((a, b) => {
        for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return a[i] - b[i];
        }
        return 0;
    })[0];
}

/**
 * Reorder notes to show them in root position based on the identified chord
 */
function reorderNotesToRootPosition(inputNotes, chordIndex, rootNote, mappedRootPosition) {
    if (chordIndex < 0) return inputNotes; // Unknown chord, keep original order
    
    try {
        console.log(`Reordering notes for chord index ${chordIndex}, root note ${rootNote}`);
        
        // If we have the mapped root position from chord_mapping.txt, use it directly
        if (mappedRootPosition && mappedRootPosition.length === 4) {
            console.log(`Using mapped root position from chord_mapping.txt: ${mappedRootPosition.join(', ')}`);
            
            // First, convert all notes to MIDI values for comparison
            const inputMidiValues = inputNotes.map(note => noteToMidi(note));
            const mappedMidiValues = mappedRootPosition.map(note => noteToMidi(note));
            
            // Find the transposition needed
            const rootMidiValue = noteToMidi(rootNote);
            const mappedRootMidiValue = noteToMidi(mappedRootPosition[0]); // First note in mapped position is root
            const transposition = (rootMidiValue - mappedRootMidiValue + 12) % 12;
            
            console.log('Input MIDI values:', inputMidiValues);
            console.log('Mapped MIDI values:', mappedMidiValues);
            console.log('Root MIDI value:', rootMidiValue);
            console.log('Mapped root MIDI value:', mappedRootMidiValue);
            console.log('Transposition needed:', transposition);
            
            // Create a map of input MIDI values to their original notes
            const midiToInputNote = {};
            inputNotes.forEach(note => {
                const midi = noteToMidi(note);
                midiToInputNote[midi] = note;
            });
            
            // Create the result array by following the mapped pattern
            const result = [];
            for (let i = 0; i < mappedRootPosition.length; i++) {
                const targetMidi = (noteToMidi(mappedRootPosition[i]) + transposition) % 12;
                // Find the input note that matches this MIDI value
                const matchingNote = inputNotes.find(note => noteToMidi(note) === targetMidi);
                if (matchingNote) {
                    result.push(matchingNote);
                }
            }
            
            // Only return the result if we found all 4 notes
            if (result.length === 4) {
                console.log(`Reordered to: ${result.join(', ')} based on mapped position`);
                return result;
            } else {
                console.warn(`Could not map all notes using root position mapping, falling back to simpler method. Found ${result.length} notes, needed 4.`);
                console.warn(`Input notes: ${inputNotes.join(', ')}, MIDI values: ${inputMidiValues.join(', ')}`);
                console.warn(`Mapped notes: ${mappedRootPosition.join(', ')}, MIDI values: ${mappedMidiValues.join(', ')}`);
                console.warn(`MIDI to input map:`, midiToInputNote);
            }
        }
        
        // Fallback to our original method if the mapping approach doesn't work
        // Get the chord type
        const chord = chordTypes[chordIndex];
        if (!chord) {
            console.error("Invalid chord index:", chordIndex);
            return inputNotes;
        }
        
        // First find the index of the root note in our input
        const rootIndex = inputNotes.findIndex(note => noteToMidi(note) === noteToMidi(rootNote));
        if (rootIndex === -1) {
            console.warn(`Root note ${rootNote} not found in input notes:`, inputNotes);
            return inputNotes;
        }
        
        // For all chord types, put the root first followed by the other notes in order of intervals
        // Convert notes to MIDI for interval calculation
        const noteValues = inputNotes.map(noteToMidi);
        const rootValue = noteValues[rootIndex];
        
        // Calculate intervals relative to root
        const intervals = [];
        for (let i = 0; i < noteValues.length; i++) {
            intervals.push({
                index: i,
                note: inputNotes[i],
                interval: (noteValues[i] - rootValue + 12) % 12
            });
        }
        
        // Sort intervals to identify chord members
        const sortedByInterval = [...intervals].sort((a, b) => a.interval - b.interval);
        
        // Place the root first, then add other notes in ascending interval order
        const result = [rootNote];
        
        // Add remaining notes in order of increasing interval
        for (let i = 1; i < sortedByInterval.length; i++) {
            if (sortedByInterval[i].note !== rootNote) {
                result.push(sortedByInterval[i].note);
            }
        }
        
        console.log(`Reordered to: ${result.join(', ')} using interval sorting`);
        return result;
    } catch (error) {
        console.error("Error in reorderNotesToRootPosition:", error);
        return inputNotes; // Return original notes on error
    }
}

/**
 * Display the badge for newly discovered chords
 */
function showNewDiscoveryBadge() {
    if (domElements.discoveryBadge) {
        domElements.discoveryBadge.classList.remove('hidden');
        domElements.chordResult.classList.add('new-discovery');
    }
}

/**
 * Hide the badge for discoveries
 */
function hideNewDiscoveryBadge() {
    if (domElements.discoveryBadge) {
        domElements.discoveryBadge.classList.add('hidden');
        domElements.chordResult.classList.remove('new-discovery');
    }
}

/**
 * Helper function to compare arrays
 */
function arraysEqual(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

/**
 * Identify a chord using the lookup table
 */
function identifyChord() {
    try {
        console.log("Identify chord function called");
        console.log("chordTypes defined:", typeof chordTypes !== 'undefined', "length:", chordTypes ? chordTypes.length : 0);
        
        // Get the selected notes
        const note1 = document.getElementById('note1').value;
        const note2 = document.getElementById('note2').value;
        const note3 = document.getElementById('note3').value;
        const note4 = document.getElementById('note4').value;
        const selectedNotes = [note1, note2, note3, note4];
        console.log("Selected notes:", selectedNotes);
        
        // Show the result area
        const resultArea = document.querySelector('.result-area');
        if (resultArea) {
            resultArea.classList.remove('hidden');
        }
        
        // Hide the badge initially when identifying a new chord
        hideNewDiscoveryBadge();
        
        // Reset any special styling on the result area
        domElements.chordResult.classList.remove('new-discovery');
        domElements.chordResult.classList.remove('validation-message');
        
        // Check if there are 4 unique notes
        const uniqueNotes = [...new Set(selectedNotes)];
        if (uniqueNotes.length < 4) {
            // Display message that 4 different notes are needed
            domElements.resultNotes.textContent = selectedNotes.join(', ');
            domElements.resultType.textContent = "Need 4 Different Notes";
            domElements.resultName.textContent = "Please select 4 different notes";
            
            domElements.chordResult.classList.remove('hidden');
            domElements.chordResult.classList.add('validation-message');
            return;
        }
        
        // Lookup the chord by normalizing the note order
        const normalizedNotes = [...selectedNotes].sort();
        const key = normalizedNotes.join(',');
        const chordInfo = chordMappings[key];
        
        if (chordInfo) {
            console.log("Found chord:", chordInfo);
            
            // Find the chord index in our chordTypes array
            // CRITICAL FIX: Extract just the chord type without the root note
            let chordType = chordInfo.type;
            
            // If the chord type starts with a note name (e.g., 'C Maj7'), extract just the type part
            if (/^[A-G][#b]?\s/.test(chordType)) {
                chordType = chordType.replace(/^[A-G][#b]?\s+/, '');
                console.log("Extracted chord type without root note:", chordType);
            }
            
            console.log("Looking for chord type:", chordType);
            
            // Store the original chord type for discovery purposes
            const originalChordType = chordType;
            
            // --- Robust normalization for chord type matching ---
            function normalizeChordName(name) {
                return name.toLowerCase()
                    .replace(/–/g, '-') // handle en dash
                    .replace(/maj/g, 'ma')
                    .replace(/min/g, 'mi')
                    .replace(/m(?=\d)/g, 'mi') // m7, m9, etc. to mi7, mi9
                    .replace(/m(?=aj)/g, 'ma') // maj, maj7, etc.
                    .replace(/m(?=in)/g, 'mi') // min, min7, etc.
                    .replace(/add\*/g, 'add')
                    .replace(/omit\*/g, 'omit')
                    .replace(/sus\*/g, 'sus')
                    .replace(/\s+/g, '')
                    .replace(/\*/g, '')
                    .replace(/#/g, 'sharp')
                    .replace(/b/g, 'flat')
                    .replace(/–/g, '-')
                    .replace(/_/g, '')
                    .replace(/\./g, '')
                    .replace(/\(/g, '').replace(/\)/g, '');
            }

            let chordIndex = chordTypes.findIndex(chord => chord.name === chordType);
            console.log("Initial chord lookup result:", { chordType, foundIndex: chordIndex });

            if (chordIndex === -1) {
                // Try robust normalization
                const normalizedType = normalizeChordName(chordType);
                chordIndex = chordTypes.findIndex(chord => {
                    const normalizedChordName = normalizeChordName(chord.name);
                    return normalizedChordName === normalizedType;
                });
                if (chordIndex !== -1) {
                    console.log(`Found match using normalization: ${chordTypes[chordIndex].name}`, chordIndex);
                } else {
                    // Comprehensive list of all 43 chord types from 43.txt
                    // Each chord must be matched exactly to be considered discovered
                    const allChordTypes = [
                        '-7', '-7#5', '-7add*b2-omit5', '-7b5',
                        '7', '7#5', '7#5sus2', '7add*b2-omit5', '7b5', '7b5sus*b2',
                        '7sus*b2', '7sus2', '7sus4',
                        'Cluster',
                        'dimMaj7', 'dimMaj7sus2',
                        'Maj7b5sus*b2', 'Maj7', 'Maj7#5', 'Maj7#5add6-omit3', 'Maj7#5sus*b2',
                        'Maj7#5sus2', 'Maj7#5sus4', 'Maj7add*#2-omit5', 'Maj7add#11-omit3',
                        'Maj7add2-omit5', 'Maj7add6-omit3', 'Maj7add6-omit5', 'Maj7b5',
                        'Maj7b5-omit3', 'Maj7b5sus4', 'Maj7sus*b2', 'Maj7sus*b2&4-omit5',
                        'Maj7sus*b2-omit5', 'Maj7sus*b2add6-omit5', 'Maj7sus2', 'Maj7sus2&4',
                        'Maj7sus4', 'minMaj7', 'minMaj7#5', 'minMaj7add4-omit5',
                        'minMaj7sus*b2-omit5', 'o7'
                    ];
                    
                    // Create a map of normalized chord names to original chord names
                    const normalizedToOriginal = {};
                    allChordTypes.forEach(type => {
                        normalizedToOriginal[normalizeChordName(type)] = type;
                    });

                    // Find exact match by normalized name
                    const normalizedSearchType = normalizeChordName(chordType);
                    
                    // First check if the normalized name is in our map
                    if (normalizedToOriginal[normalizedSearchType]) {
                        const exactType = normalizedToOriginal[normalizedSearchType];
                        chordIndex = chordTypes.findIndex(chord => chord.name === exactType);
                        if (chordIndex !== -1) {
                            console.log(`Found exact match using normalized lookup: ${chordTypes[chordIndex].name}`, chordIndex);
                        }
                    }

                    // If still not found, try with specific patterns
                    if (chordIndex === -1) {
                        // Special case patterns for complex chord types
                        const specialPatterns = [
                            [/maj7add\*#2-omit5/i, 'Maj7add*#2-omit5'],
                            [/-7add\*b2-omit5/i, '-7add*b2-omit5'],
                            [/7add\*b2-omit5/i, '7add*b2-omit5'],
                            [/maj7#5add6-omit3/i, 'Maj7#5add6-omit3'],
                            [/maj7add#11-omit3/i, 'Maj7add#11-omit3'],
                            [/maj7add2-omit5/i, 'Maj7add2-omit5'],
                            [/maj7add6-omit3/i, 'Maj7add6-omit3'],
                            [/maj7add6-omit5/i, 'Maj7add6-omit5'],
                            [/maj7b5-omit3/i, 'Maj7b5-omit3'],
                            [/maj7sus\*b2&4-omit5/i, 'Maj7sus*b2&4-omit5'],
                            [/maj7sus\*b2-omit5/i, 'Maj7sus*b2-omit5'],
                            [/maj7sus\*b2add6-omit5/i, 'Maj7sus*b2add6-omit5'],
                            [/maj7sus2&4/i, 'Maj7sus2&4'],
                            [/minmaj7add4-omit5/i, 'minMaj7add4-omit5'],
                            [/minmaj7sus\*b2-omit5/i, 'minMaj7sus*b2-omit5']
                        ];

                        for (const [pattern, exactName] of specialPatterns) {
                            if (pattern.test(chordType)) {
                                chordIndex = chordTypes.findIndex(chord => chord.name === exactName);
                                if (chordIndex !== -1) {
                                    console.log(`Found match using special pattern: ${chordTypes[chordIndex].name}`, chordIndex);
                                    break;
                                }
                            }
                        }
                    }
                    
                    // If still not found, log the failure for debugging
                    if (chordIndex === -1) {
                        console.warn("Could not find chord type (exact only):", chordType, "Normalized:", normalizedSearchType, "Available chord types:", chordTypes.map(c => c.name));
                    }
                }
            }
            
            // If not found, try case-insensitive matching but ONLY for EXACT matches
            if (chordIndex === -1) {
                console.log("Exact match not found, trying case-insensitive exact matching");
                
                // Normalize the chord type for more flexible matching but maintain full structure
                const normalizeChordName = (name) => {
                    return name.toLowerCase()
                        .replace(/\s+/g, '')    // Remove spaces
                        .replace(/maj/g, 'ma')  // Normalize Maj/Ma variants
                        .replace(/min/g, 'mi'); // Normalize Min/Mi variants
                };
                
                const normalizedType = normalizeChordName(chordType);
                
                // ONLY do exact matches - no substring matching!
                chordIndex = chordTypes.findIndex(chord => {
                    const normalizedChordName = normalizeChordName(chord.name);
                    return normalizedChordName === normalizedType;
                });
                
                if (chordIndex !== -1) {
                    console.log(`Found match using case-insensitive exact match: ${chordTypes[chordIndex].name}`, chordIndex);
                } else {
                    console.log("Failed to find exact chord match - checking if this is a known chord type");
                    
                    // Get the chord type from the mapping
                    const mappedType = chordInfo.type;
                    console.log(`Mapped chord type from chord_mapping.txt: ${mappedType}`);
                    
                    // Find the EXACT chord type in chordTypes
                    chordIndex = chordTypes.findIndex(chord => chord.name === mappedType);
                    
                    if (chordIndex !== -1) {
                        console.log(`Found exact match using mapped type: ${chordTypes[chordIndex].name}`, chordIndex);
                    } else {
                        console.log("All exact chord matching methods failed");
                    }
                }
            }
            
            // Get the root note from the chord info
            const rootNoteName = chordInfo.name.split(' ')[0];
            
            // Get the root position from the chord mapping
            const mappedRootPosition = chordInfo.rootPosition;
                    
                    // Display the result
                    console.log("Displaying result with chordIndex:", chordIndex);
                    
                    // CRITICAL FIX: Force a valid chord index for discovery
                    // If we couldn't find the chord in chordTypes but have a valid type from mapping,
                    // find the index by direct name comparison
                    if (chordIndex === -1 && chordInfo.type) {
                        console.log("Chord index not found, searching by direct type name:", chordInfo.type);
                        
                        // Try to find the chord type by exact name match
                        for (let i = 0; i < chordTypes.length; i++) {
                            if (chordTypes[i].name === chordInfo.type) {
                                chordIndex = i;
                                console.log("Found chord index by direct name match:", chordIndex);
                                break;
                            }
                        }
                    }
                    
                    // Use the exact chord type from chordTypes for discovery to ensure proper matching
                    const exactChordType = chordIndex >= 0 ? chordTypes[chordIndex].name : chordInfo.type;
                    console.log("Using exact chord type for discovery:", exactChordType);
                    
                    // CRITICAL FIX: Force log the chord index and type for debugging
                    console.log("FINAL CHORD DATA FOR DISCOVERY:", {
                        index: chordIndex,
                        type: exactChordType,
                        originalType: chordInfo.type,
                        name: chordInfo.name
                    });
                    
                    displayResult(
                        selectedNotes,
                        exactChordType, // Use the exact chord type from chordTypes
                        chordInfo.name,
                        chordIndex, // Pass the chord index directly, even if -1
                        rootNoteName,
                        mappedRootPosition
            );
        } else {
            // Chord not found in our mappings
        console.log("No match found for the chord");
        displayResult(
            selectedNotes,
            "[Unknown]",
            "[Unknown]",
            -1
        );
        }
    } catch (error) {
        console.error("Error in identifyChord:", error);
        
        // Show the result area
        const resultArea = document.querySelector('.result-area');
        if (resultArea) {
            resultArea.classList.remove('hidden');
        }
        
        // Show error in result area
        if (domElements.resultNotes && domElements.resultType && domElements.chordResult) {
            domElements.resultNotes.textContent = "Error";
            domElements.resultType.textContent = "Error identifying chord";
            domElements.resultName.textContent = error.message || "Unknown error";
            domElements.chordResult.classList.remove('hidden');
        }
    }
}

/**
 * Display the identified chord result
 */
function displayResult(notes, chordType, standardName, chordIndex, rootNote, mappedRootPosition) {
    console.log('Display Result Input:', {
        notes,
        chordType,
        standardName,
        chordIndex,
        rootNote,
        mappedRootPosition
    });

    // Always try to reorder notes to root position if we have a valid chord
    const rootPositionNotes = (chordIndex >= 0 && rootNote && mappedRootPosition) ? 
        reorderNotesToRootPosition(notes, chordIndex, rootNote, mappedRootPosition) : notes;
    
    console.log('Root Position Notes:', rootPositionNotes);
    
    // Update the UI
    // If we have a valid chord with root position information from the mapping file, show that
    if (chordIndex >= 0 && mappedRootPosition && mappedRootPosition.length > 0) {
        domElements.resultNotes.textContent = mappedRootPosition.join(', ');
    } else {
        domElements.resultNotes.textContent = rootPositionNotes.join(', ');
    }
    // Show only the type for chordType (remove root note if present)
    let justType = chordType;
    if (typeof chordType === 'string') {
        // Remove root note (e.g., 'C Maj7' -> 'Maj7')
        justType = chordType.replace(/^([A-G][#b]?\s*)/, '').trim();
    }
    domElements.resultType.textContent = justType;
    // Change label to 'Chord Name' instead of 'Standard Name'
    if (domElements.resultName && domElements.resultName.previousElementSibling) {
        domElements.resultName.previousElementSibling.textContent = 'Chord Name:';
    }
    domElements.resultName.textContent = standardName;
    
    // Remove any special styling
    domElements.chordResult.classList.remove('hidden');
    domElements.chordResult.classList.remove('validation-message');
    
    // Hide the badge initially
    hideNewDiscoveryBadge();
    
    // If this is a valid chord (not unknown), save it to discovered chords
    if (chordIndex >= 0) {
        console.log('[Discovery] About to save chord with index:', chordIndex);
        
        // Get previously discovered chords
        const previouslyDiscovered = getDiscoveredChords();
        
        // Save the newly discovered chord - use the index directly as in the old version
        const discovered = saveDiscoveredChord(chordIndex);
        console.log('[Discovery] Discovered chords after save:', discovered);
        
        // Check if this is a newly discovered chord
        if (!previouslyDiscovered.includes(chordIndex)) {
            console.log('[Discovery] This is a newly discovered chord');
            
            // Remove the animation from the last discovered chord
            if (lastDiscoveredChord !== null) {
                const lastChordCard = document.querySelector(`.chord-card[data-index="${lastDiscoveredChord}"]`);
                if (lastChordCard) {
                    lastChordCard.classList.remove('new-discovery');
                }
            }
            
            // Update the newly discovered chord
            newlyDiscoveredChords = [chordIndex];
            lastDiscoveredChord = chordIndex;
            
            // Add new-discovery class to result area and show badge
            domElements.chordResult.classList.add('new-discovery');
            showNewDiscoveryBadge();
        }
        
        // Update the discovery progress - simple and direct as in the old version
        updateDiscoveryProgress(discovered);
    }
}

/**
 * Initialize the discovery DOM elements
 */
function initializeDiscoveryDOMElements() {
    // Get references to the DOM elements needed for discovery
    domElements.discoveredChordsContainer = document.getElementById('discovered-chords');
    domElements.progressFill = document.getElementById('progress-fill');
    domElements.progressText = document.getElementById('progress-text');
    
    console.log('[DEBUG] Re-initialized discovery DOM elements:', {
        container: domElements.discoveredChordsContainer,
        progressFill: domElements.progressFill,
        progressText: domElements.progressText
    });
}

/**
 * Update the discovery progress UI
 */
function updateDiscoveryProgress(discovered) {
    console.log('[Discovery] updateDiscoveryProgress called with:', discovered);
    const total = chordTypes.length;
    const count = discovered.length;
    
    // Update progress bar
    const percentage = (count / total) * 100;
    domElements.progressFill.style.width = `${percentage}%`;
    
    // Change progress bar to gold if all chords are discovered
    if (count === total) {
        domElements.progressFill.style.background = 'linear-gradient(45deg, #ffdc68, #ffba08)';
        
        // Show a special badge if it doesn't already exist
        if (!document.getElementById('completion-badge')) {
            const completionBadge = document.createElement('div');
            completionBadge.id = 'completion-badge';
            completionBadge.className = 'completion-badge';
            completionBadge.textContent = 'YOU DID IT!';
            
            // Add it to the discovery header
            const discoveryHeader = document.querySelector('.discovery-header');
            if (discoveryHeader) {
                discoveryHeader.appendChild(completionBadge);
            }
            
            // Add celebration animation to the progress bar container
            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.classList.add('celebration');
            }
        }
    } else {
        // Reset to default style if not all discovered
        domElements.progressFill.style.background = '';
        
        // Remove completion badge if it exists
        const completionBadge = document.getElementById('completion-badge');
        if (completionBadge) {
            completionBadge.remove();
        }
        
        // Remove celebration class
        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.classList.remove('celebration');
        }
    }
    
    // Update the progress text
    if (domElements.progressText) {
        domElements.progressText.textContent = `${count}/${total} Discovered`;
        console.log(`Updated progress text: ${count}/${total} Discovered`);
    } else {
        console.error("Progress text element not found");
    }
    
    // Update the discovered chords grid
    updateDiscoveredChordsGrid(discovered);
}

/**
 * Update the discovered chords grid
 */
function updateDiscoveredChordsGrid(discovered) {
    console.log('[Discovery] updateDiscoveredChordsGrid called with:', discovered);
    
    // Check if DOM elements are properly initialized
    console.log('[DEBUG] DOM elements check:', {
        container: domElements.discoveredChordsContainer,
        progressFill: domElements.progressFill,
        progressText: domElements.progressText
    });
    
    // Check if discovered is an array with valid values
    if (!Array.isArray(discovered)) {
        console.error('[DEBUG] discovered is not an array:', discovered);
        discovered = [];
    }
    
    console.log('[DEBUG] discovered array:', discovered);
    
    if (!domElements.discoveredChordsContainer) {
        console.error("Discovered chords container not found");
        return;
    }
    
    // Clear the container
    domElements.discoveredChordsContainer.innerHTML = '';
    console.log('[DEBUG] Cleared container, about to add chord cards');
    
    // Now that chordTypes is ordered correctly, we can use it directly
    // Count how many cards are created
    let validChordCount = 0;
    
    // Sort chordTypes by name alphabetically (case-insensitive, ignoring root note)
    const sortedChordTypes = chordTypes
        .map((chord, idx) => ({ ...chord, _originalIndex: idx }))
        .sort((a, b) => {
            // Remove root note for sorting
            const nameA = (typeof a.name === 'string' ? a.name.replace(/^([A-G][#b]?\s*)/, '').trim().toLowerCase() : '').toLowerCase();
            const nameB = (typeof b.name === 'string' ? b.name.replace(/^([A-G][#b]?\s*)/, '').trim().toLowerCase() : '').toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
        });

    for (let i = 0; i < sortedChordTypes.length; i++) {
        if (validChordCount >= 43) break; // Stop once we have 43 cards
        
        validChordCount++;
        const chord = sortedChordTypes[i];
        const originalIndex = chord._originalIndex;
        
        // Force convert index to number for comparison
        const isDiscovered = discovered.includes(originalIndex) || discovered.includes(String(originalIndex));
        const isNewlyDiscovered = newlyDiscoveredChords.includes(originalIndex) || newlyDiscoveredChords.includes(String(originalIndex));
        
        console.log(`[DEBUG] Creating card for chord ${originalIndex}: ${chord.name}, discovered: ${isDiscovered}`);
        
        const chordCard = document.createElement('div');
        let className = 'chord-card';
        
        if (isDiscovered) {
            className += ' discovered';
            if (isNewlyDiscovered) {
                className += ' new-discovery';
            }
        } else {
            className += ' undiscovered';
        }
        
        chordCard.className = className;
        chordCard.setAttribute('data-index', originalIndex);
        
        if (isDiscovered) {
            // Create the inner container for the flip effect
            const cardInner = document.createElement('div');
            cardInner.className = 'card-inner';
            
            // Create front side (just chord type)
            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            
            const chordName = document.createElement('div');
            chordName.className = 'chord-name';
            // Show only the type (remove root note)
            let justType = chord.name;
            if (typeof chord.name === 'string') {
                justType = chord.name.replace(/^([A-G][#b]?\s*)/, '').trim();
            }
            chordName.textContent = justType;
            cardFront.appendChild(chordName);
            
            // Create back side (detailed info)
            const cardBack = document.createElement('div');
            cardBack.className = 'card-back';
            
            const chordIntervals = document.createElement('div');
            chordIntervals.className = 'chord-intervals';
            chordIntervals.textContent = `Intervals: ${chord.intervals.join(', ')}`;
            
            const exampleNotes = document.createElement('div');
            exampleNotes.className = 'chord-notes';
            exampleNotes.textContent = `Ex. C${chord.name}: ${chord.rootPositionExample.join(', ')}`;
            
            cardBack.appendChild(chordIntervals);
            cardBack.appendChild(exampleNotes);
            
            // Add front and back to the inner container
            cardInner.appendChild(cardFront);
            cardInner.appendChild(cardBack);
            
            // Add the inner container to the card
            chordCard.appendChild(cardInner);
            
            // Add click event to flip the card and play audio
            chordCard.addEventListener('click', function() {
                // Toggle flipped state
                const wasFlipped = this.classList.contains('flipped');
                this.classList.toggle('flipped');
                
                // Play the chord when flipping to back (not when flipping back to front)
                if (!wasFlipped) {
                    // Play after a tiny delay to coincide with the flip animation
                    setTimeout(() => {
                        // Play the chord's root position example (C + chord type)
                        playChord(chord.rootPositionExample);
                    }, 200);
                }
            });
        } else {
            chordCard.textContent = '???';
        }
        
        domElements.discoveredChordsContainer.appendChild(chordCard);
    }
    
    console.log(`Created ${validChordCount} chord cards`);
    
    // Force all 43 cards by adding placeholders if needed
    if (validChordCount < 43) {
        console.warn(`Only created ${validChordCount} cards, adding ${43 - validChordCount} placeholders`);
        for (let i = validChordCount; i < 43; i++) {
            const placeholderCard = document.createElement('div');
            placeholderCard.className = 'chord-card undiscovered';
            placeholderCard.textContent = '???';
            domElements.discoveredChordsContainer.appendChild(placeholderCard);
        }
    }
    
    console.log(`Updated chord grid with ${discovered.length} discovered chords`);

    // --- SCROLL TO NEWLY DISCOVERED CHORD ---
    // Only scroll if there is a new discovery
    if (newlyDiscoveredChords && newlyDiscoveredChords.length > 0) {
        const container = domElements.discoveredChordsContainer;
        if (container) {
            const newCard = container.querySelector('.chord-card.new-discovery');
            if (newCard) {
                newCard.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
            }
        }
    }
}

/**
 * Fallback function for updating the chord grid if order.txt can't be loaded
 */
function updateDiscoveredChordsGridFallback(discovered) {
    // Call the main function since it no longer depends on loading order.txt
    updateDiscoveredChordsGrid(discovered);
}

/**
 * Initialize the application
 */
function initialize() {
    console.log("Initializing chord discovery application");
    
    // First load the chord mappings
    loadChordMappings().then(() => {
        console.log("Chord mappings loaded, initializing rest of app");
        
        // Initialize storage to ensure it exists
        initializeStorage();
        
        // Force localStorage to be properly initialized
        if (!localStorage.getItem('discoveredChords')) {
            localStorage.setItem('discoveredChords', JSON.stringify([]));
            console.log("Set empty discoveredChords array");
        }
        
        // Migrate any existing discovered chord data to the new ordering
        migrateChordData();
    
    // Select DOM elements
    domElements.identifyBtn = document.getElementById('identify-btn');
    domElements.chordResult = document.getElementById('chord-result');
    domElements.resultNotes = document.getElementById('result-notes');
    domElements.resultType = document.getElementById('result-type');
    domElements.resultName = document.getElementById('result-name');
    domElements.progressFill = document.getElementById('progress-fill');
    domElements.progressText = document.getElementById('progress-text');
    domElements.discoveredChordsContainer = document.getElementById('discovered-chords');
    domElements.discoveryBadge = document.getElementById('discovery-badge');
    domElements.resetBtn = document.getElementById('reset-discoveries');
    
    // Debug DOM elements
    console.log('[DEBUG] DOM elements initialized:', {
        identifyBtn: !!domElements.identifyBtn,
        chordResult: !!domElements.chordResult,
        resultNotes: !!domElements.resultNotes,
        resultType: !!domElements.resultType,
        resultName: !!domElements.resultName,
        progressFill: !!domElements.progressFill,
        progressText: !!domElements.progressText,
        discoveredChordsContainer: !!domElements.discoveredChordsContainer,
        discoveryBadge: !!domElements.discoveryBadge,
        resetBtn: !!domElements.resetBtn
    });
    
    // Force create the discovered chords container if it doesn't exist
    if (!domElements.discoveredChordsContainer) {
        console.error('[DEBUG] Discovered chords container not found, creating it');
        const container = document.querySelector('.chord-grid');
        if (container) {
            domElements.discoveredChordsContainer = container;
        } else {
            // Try to create it
            const discoveryLog = document.querySelector('.discovery-log');
            if (discoveryLog) {
                const newContainer = document.createElement('div');
                newContainer.id = 'discovered-chords';
                newContainer.className = 'chord-grid';
                discoveryLog.appendChild(newContainer);
                domElements.discoveredChordsContainer = newContainer;
                console.log('[DEBUG] Created new discovered chords container');
            }
        }
    }
    
    console.log("DOM elements selected:", domElements);
    
    // Make sure chord result and result area are hidden initially
    if (domElements.chordResult) {
        domElements.chordResult.classList.add('hidden');
    }
    
    const resultArea = document.querySelector('.result-area');
    if (resultArea) {
        resultArea.classList.add('hidden');
    }
    
    // Add event listener to the identify button
    if (domElements.identifyBtn) {
        domElements.identifyBtn.addEventListener('click', identifyChord);
        console.log("Event listener added to identify button");
    } else {
        console.error("Could not find identify button!");
    }

    // Add keyboard support for Space and Enter to trigger Identify
    window.addEventListener('keydown', function(e) {
        // Ignore if focus is on an input, select, or textarea
        const tag = document.activeElement.tagName.toLowerCase();
        if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            if (domElements.identifyBtn) {
                domElements.identifyBtn.click();
            }
        }
    });

    // Blur .note-select dropdowns after selection (so keyboard shortcut works immediately)
    document.querySelectorAll('.note-select').forEach(function(select) {
        select.addEventListener('change', function() {
            this.blur();
        });
    });
    
    // Add event listener to the reset button
    if (domElements.resetBtn) {
        domElements.resetBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all your chord discoveries?')) {
                clearDiscoveredChords();
                newlyDiscoveredChords = [];
                lastDiscoveredChord = null;
                
                // Hide the badge
                hideNewDiscoveryBadge();
                
                // Hide the result area when resetting
                if (domElements.chordResult) {
                    domElements.chordResult.classList.add('hidden');
                }
                
                const resultArea = document.querySelector('.result-area');
                if (resultArea) {
                    resultArea.classList.add('hidden');
                }
                
                updateDiscoveryProgress([]);
            }
        });
        console.log("Event listener added to reset button");
    }
        
        // Add hidden developer feature - discover all chords when clicking "all"
        const devUnlock = document.getElementById('dev-unlock');
        if (devUnlock) {
            let clickCount = 0;
            let clickTimer = null;
            
            devUnlock.addEventListener('click', () => {
                // Count clicks and reset after a timeout
                clickCount++;
                
                // Clear existing timer
                if (clickTimer) {
                    clearTimeout(clickTimer);
                }
                
                // Set a new timer to reset click count after 1 second
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 1000);
                
                // Require 3 clicks to activate (hidden feature, not obvious)
                if (clickCount >= 3) {
                    console.log("🔓 Developer mode: Unlocking all chords");
                    
                    // Unlock all chords with indices 0-42
                    const allChords = Array.from({ length: 43 }, (_, i) => i);
                    
                    console.log(`Unlocking ${allChords.length} chords`);
                    
                    // Save all chords as discovered
                    localStorage.setItem('discoveredChords', JSON.stringify(allChords));
                    
                    // Update the UI
                    updateDiscoveryProgress(allChords);
                    
                    // Flash the progress bar as an indication
                    const progressBar = document.querySelector('.progress-bar');
                    if (progressBar) {
                        progressBar.style.transition = 'background-color 0.3s';
                        progressBar.style.backgroundColor = '#ffba08';
                        setTimeout(() => {
                            progressBar.style.backgroundColor = '';
                            progressBar.style.transition = '';
                        }, 500);
                    }
                    
                    // Reset click counter
                    clickCount = 0;
                }
            });
            
            console.log("Developer feature initialized");
        }
    
    // Initialize the discovery progress
    const discovered = getDiscoveredChords();
    console.log("[DEBUG] Discovered chords at init:", discovered);
    
    // Force update even if discovered is empty
    if (!discovered || discovered.length === 0) {
        console.log("[DEBUG] No discovered chords found, ensuring UI is reset");
    }
    
    updateDiscoveryProgress(discovered);
    
    // Force the progress text to update
    if (domElements.progressText) {
        const total = chordTypes.length;
        const count = discovered.length;
        domElements.progressText.textContent = `${count}/${total} Discovered`;
        console.log(`[DEBUG] Force updated progress text: ${count}/${total} Discovered`);
    }
    
    // Reset newly discovered chords
    newlyDiscoveredChords = [];
    
    console.log("Application initialization complete");
    });
}

/**
 * Migrate chord data after reordering the chordTypes array
 * This handles the transition from the old chord order to the new one
 */
function migrateChordData() {
    console.log("[DEBUG] Running chord data migration");
    try {
        // Get the currently saved discovered chords (using old indices)
        console.log("[DEBUG] localStorage available:", !!window.localStorage);
        console.log("[DEBUG] chordTypes available:", !!window.chordTypes);
        const oldDiscovered = JSON.parse(localStorage.getItem('discoveredChords') || '[]');
        
        if (oldDiscovered.length === 0) {
            console.log("No saved chord data to migrate");
            // Ensure localStorage is initialized
            localStorage.setItem('discoveredChords', JSON.stringify([]));
            return; // No data to migrate
        }
        
        console.log("Migrating chord data from old to new indices");
        
        // Since we have old discovered chords but the indices have changed due to reordering,
        // we need to reset the localStorage and let users rediscover chords.
        // This is the safest approach since we can't reliably map old indices to new ones
        // without knowing the original chordTypes array order.
        
        console.log("Resetting discovered chords due to reordering of the chord types array");
        localStorage.setItem('discoveredChords', JSON.stringify([]));
        
        console.log("Chord data migration complete");
    } catch (error) {
        console.error("Error migrating chord data:", error);
        // Reset discovered chords as a fallback if migration fails
        localStorage.setItem('discoveredChords', JSON.stringify([]));
    }
}

// Start the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('[DEBUG] DOM content loaded, initializing app');
    
    // Initialize the app
    initialize();
    
    // Force a redraw of the discovery grid after a short delay
    setTimeout(() => {
        console.log('[DEBUG] Forcing redraw of discovery grid after initialization');
        // Re-initialize DOM elements to ensure they're available
        initializeDiscoveryDOMElements();
        // Then update the grid with discovered chords
        const discovered = getDiscoveredChords();
        updateDiscoveredChordsGrid(discovered);
    }, 1000);  // Increased timeout to ensure DOM is fully ready
}); 