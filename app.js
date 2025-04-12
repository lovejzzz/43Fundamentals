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
    discoveredChordsContainer: null,
    discoveryBadge: null,
    resetBtn: null
};

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
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;
            
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
            const chordType = chordInfo.type;
            console.log("Looking for chord type:", chordType);
            
            // Also try normalized matching if exact match fails
            let chordIndex = chordTypes.findIndex(chord => chord.name === chordType);
            
            // If not found, try case-insensitive matching and handle "Ma" vs "Maj" differences
            if (chordIndex === -1) {
                console.log("Exact match not found, trying flexible matching");
                
                // Normalize the chord type for more flexible matching
                const normalizeChordName = (name) => {
                    return name.toLowerCase()
                        .replace(/\s+/g, '')    // Remove spaces
                        .replace(/\*/g, '')     // Remove asterisks
                        .replace(/maj/g, 'ma')  // Normalize Maj/Ma variants
                        .replace(/min/g, 'mi'); // Normalize Min/Mi variants
                };
                
                const normalizedType = normalizeChordName(chordType);
                
                chordIndex = chordTypes.findIndex(chord => {
                    const normalizedChordName = normalizeChordName(chord.name);
                    return normalizedChordName === normalizedType;
                });
                
                if (chordIndex !== -1) {
                    console.log(`Found match using normalization: ${chordTypes[chordIndex].name}`);
                }
            }
            
            // Get the root note from the chord info
            const rootNoteName = chordInfo.name.split(' ')[0];
            
            // Get the root position from the chord mapping
            const mappedRootPosition = chordInfo.rootPosition;
                    
                    // Display the result
                    displayResult(
                        selectedNotes,
                chordInfo.type,
                chordInfo.name,
                chordIndex >= 0 ? chordIndex : -1,
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
    domElements.resultType.textContent = chordType;
    domElements.resultName.textContent = standardName;
    
    // Remove any special styling
    domElements.chordResult.classList.remove('hidden');
    domElements.chordResult.classList.remove('validation-message');
    
    // Hide the badge initially
    hideNewDiscoveryBadge();
    
    // If this is a valid chord (not unknown), save it to discovered chords
    if (chordIndex >= 0) {
        const previouslyDiscovered = getDiscoveredChords();
        const discovered = saveDiscoveredChord(chordIndex);
        
        // Check if this is a newly discovered chord
        if (!previouslyDiscovered.includes(chordIndex)) {
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
        
        updateDiscoveryProgress(discovered);
    }
}

/**
 * Update the discovery progress UI
 */
function updateDiscoveryProgress(discovered) {
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
    if (!domElements.discoveredChordsContainer) {
        console.error("Discovered chords container not found");
        return;
    }
    
    domElements.discoveredChordsContainer.innerHTML = '';
    
    // Now that chordTypes is ordered correctly, we can use it directly
    // Count how many cards are created
    let validChordCount = 0;
    
    // Create chord cards in the exact order they appear in chordTypes
    for (let i = 0; i < chordTypes.length; i++) {
        if (validChordCount >= 43) break; // Stop once we have 43 cards
        
        validChordCount++;
        const chord = chordTypes[i];
        const isDiscovered = discovered.includes(i);
        const isNewlyDiscovered = newlyDiscoveredChords.includes(i);
        
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
        chordCard.setAttribute('data-index', i);
        
        if (isDiscovered) {
            // Create the inner container for the flip effect
            const cardInner = document.createElement('div');
            cardInner.className = 'card-inner';
            
            // Create front side (just chord type)
            const cardFront = document.createElement('div');
            cardFront.className = 'card-front';
            
            const chordName = document.createElement('div');
            chordName.className = 'chord-name';
            chordName.textContent = chord.name;
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
            
            // Add click event to flip the card
            chordCard.addEventListener('click', function() {
                this.classList.toggle('flipped');
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
        // Then initialize the rest of the app
        
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
    updateDiscoveryProgress(discovered);
    
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
    try {
        // Get the currently saved discovered chords (using old indices)
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
document.addEventListener('DOMContentLoaded', initialize); 