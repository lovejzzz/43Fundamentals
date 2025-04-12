// Chord data from unique_chord.txt
const chordTypes = [
    { 
        intervals: [0, 1, 5, 8], 
        name: "Maj7", 
        rootIndex: 1, 
        notes: ["C", "C#", "F", "G#"],
        rootPositionExample: ["C", "E", "G", "B"]
    },
    { 
        intervals: [0, 1, 5, 9], 
        name: "Maj7#5", 
        rootIndex: 1, 
        notes: ["C", "C#", "F", "A"],
        rootPositionExample: ["C", "E", "G#", "B"]
    },
    { 
        intervals: [0, 1, 5, 7], 
        name: "Maj7b5", 
        rootIndex: 1, 
        notes: ["C", "C#", "F", "G"],
        rootPositionExample: ["C", "E", "Gb", "B"]
    },
    { 
        intervals: [0, 1, 5, 10], 
        name: "Maj7add6-omit5", 
        rootIndex: 1, 
        notes: ["C", "C#", "F", "A#"],
        rootPositionExample: ["C", "E", "A", "B"]
    },
    { 
        intervals: [0, 1, 3, 5], 
        name: "Maj7add2-omit5", 
        rootIndex: 1, 
        notes: ["C", "C#", "D#", "F"],
        rootPositionExample: ["C", "D", "E", "B"]
    },
    { 
        intervals: [0, 1, 4, 5], 
        name: "Maj7add*#2-omit5", 
        rootIndex: 1, 
        notes: ["C", "C#", "E", "F"],
        rootPositionExample: ["C", "D#", "E", "B"]
    },
    { 
        intervals: [0, 1, 5, 6], 
        name: "Maj7add#11-omit3", 
        rootIndex: 1, 
        notes: ["C", "C#", "F", "F#"],
        rootPositionExample: ["C", "F#", "G", "B"]
    },
    { 
        intervals: [0, 1, 7, 9], 
        name: "Maj7b5sus*b2", 
        rootIndex: 1, 
        notes: ["C", "C#", "G", "A"],
        rootPositionExample: ["C", "Gb", "G#", "B"]
    },
    { 
        intervals: [0, 1, 8, 10], 
        name: "Maj7add6-omit3", 
        rootIndex: 1, 
        notes: ["C", "C#", "G#", "A#"],
        rootPositionExample: ["C", "G", "A", "B"]
    },
    { 
        intervals: [0, 1, 9, 10], 
        name: "Maj7#5add6-omit3", 
        rootIndex: 1, 
        notes: ["C", "C#", "A", "A#"],
        rootPositionExample: ["C", "G#", "A", "B"]
    },
    { 
        intervals: [0, 2, 5, 9], 
        name: "-7", 
        rootIndex: 1, 
        notes: ["C", "D", "F", "A"],
        rootPositionExample: ["C", "Eb", "G", "Bb"]
    },
    { 
        intervals: [0, 2, 4, 7], 
        name: "-7#5", 
        rootIndex: 2, 
        notes: ["C", "D", "E", "G"],
        rootPositionExample: ["C", "Eb", "G#", "Bb"]
    },
    { 
        intervals: [0, 2, 5, 8], 
        name: "-7b5", 
        rootIndex: 1, 
        notes: ["C", "D", "F", "G#"],
        rootPositionExample: ["C", "Eb", "Gb", "Bb"]
    },
    { 
        intervals: [0, 1, 3, 10], 
        name: "-7add*b2-omit5", 
        rootIndex: 0, 
        notes: ["C", "C#", "D#", "A#"],
        rootPositionExample: ["C", "Db", "Eb", "Bb"]
    },
    { 
        intervals: [0, 2, 6, 9], 
        name: "7", 
        rootIndex: 1, 
        notes: ["C", "D", "F#", "A"],
        rootPositionExample: ["C", "E", "G", "Bb"]
    },
    { 
        intervals: [0, 2, 4, 8], 
        name: "7#5", 
        rootIndex: 2, 
        notes: ["C", "D", "E", "G#"],
        rootPositionExample: ["C", "E", "G#", "Bb"]
    },
    { 
        intervals: [0, 2, 6, 8], 
        name: "7b5", 
        rootIndex: 1, 
        notes: ["C", "D", "F#", "G#"],
        rootPositionExample: ["C", "E", "Gb", "Bb"]
    },
    { 
        intervals: [0, 2, 3, 6], 
        name: "7add*b2-omit5", 
        rootIndex: 1, 
        notes: ["C", "D", "D#", "F#"],
        rootPositionExample: ["C", "Db", "E", "Bb"]
    },
    { 
        intervals: [0, 1, 7, 10], 
        name: "7sus*b2", 
        rootIndex: 0, 
        notes: ["C", "C#", "G", "A#"],
        rootPositionExample: ["C", "Db", "G", "Bb"]
    },
    { 
        intervals: [0, 1, 6, 10], 
        name: "7b5sus*b2", 
        rootIndex: 0, 
        notes: ["C", "C#", "F#", "A#"],
        rootPositionExample: ["C", "Db", "Gb", "Bb"]
    },
    { 
        intervals: [0, 2, 7, 10], 
        name: "7sus2", 
        rootIndex: 0, 
        notes: ["C", "D", "G", "A#"],
        rootPositionExample: ["C", "D", "G", "Bb"]
    },
    { 
        intervals: [0, 2, 4, 6], 
        name: "7#5sus2", 
        rootIndex: 2, 
        notes: ["C", "D", "E", "A#"],
        rootPositionExample: ["C", "D", "G#", "Bb"]
    },
    { 
        intervals: [0, 2, 5, 7], 
        name: "7sus4", 
        rootIndex: 1, 
        notes: ["C", "D", "F", "G"],
        rootPositionExample: ["C", "F", "G", "Bb"]
    },
    { 
        intervals: [0, 1, 2, 8], 
        name: "Maj7sus*b2", 
        rootIndex: 1, 
        notes: ["C", "C#", "D", "G#"],
        rootPositionExample: ["C", "Db", "G", "B"]
    },
    { 
        intervals: [0, 1, 2, 5], 
        name: "Maj7sus*b2-omit5", 
        rootIndex: 1, 
        notes: ["C", "C#", "D", "F"],
        rootPositionExample: ["C", "Db", "F", "B"]
    },
    { 
        intervals: [0, 1, 2, 6], 
        name: "Maj7sus*b2&4-omit5", 
        rootIndex: 1, 
        notes: ["C", "C#", "D", "F#"],
        rootPositionExample: ["C", "Db", "F", "B"]
    },
    { 
        intervals: [0, 1, 2, 10], 
        name: "Maj7sus*b2add6-omit5", 
        rootIndex: 1, 
        notes: ["C", "C#", "D", "A#"],
        rootPositionExample: ["C", "Db", "A", "B"]
    },
    { 
        intervals: [0, 1, 2, 9], 
        name: "Maj7#5sus*b2", 
        rootIndex: 1, 
        notes: ["C", "C#", "D", "A"],
        rootPositionExample: ["C", "Db", "G#", "B"]
    },
    { 
        intervals: [0, 1, 2, 7], 
        name: "Maj7b5sus*b2", 
        rootIndex: 1, 
        notes: ["C", "C#", "D", "G"],
        rootPositionExample: ["C", "Db", "Gb", "B"]
    },
    { 
        intervals: [0, 1, 3, 8], 
        name: "Maj7sus2", 
        rootIndex: 1, 
        notes: ["C", "C#", "D#", "G#"],
        rootPositionExample: ["C", "D", "G", "B"]
    },
    { 
        intervals: [0, 1, 3, 9], 
        name: "Maj7#5sus2", 
        rootIndex: 1, 
        notes: ["C", "C#", "D#", "A"],
        rootPositionExample: ["C", "D", "G#", "B"]
    },
    { 
        intervals: [0, 1, 3, 6], 
        name: "Maj7sus2&4", 
        rootIndex: 1, 
        notes: ["C", "C#", "D#", "F#"],
        rootPositionExample: ["C", "D", "F", "B"]
    },
    { 
        intervals: [0, 1, 6, 8], 
        name: "Maj7sus4", 
        rootIndex: 1, 
        notes: ["C", "C#", "F#", "G#"],
        rootPositionExample: ["C", "F", "G", "B"]
    },
    { 
        intervals: [0, 1, 6, 9], 
        name: "Maj7#5sus4", 
        rootIndex: 1, 
        notes: ["C", "C#", "F#", "A"],
        rootPositionExample: ["C", "F", "G#", "B"]
    },
    { 
        intervals: [0, 1, 6, 7], 
        name: "Maj7b5sus4", 
        rootIndex: 1, 
        notes: ["C", "C#", "F#", "G"],
        rootPositionExample: ["C", "F", "Gb", "B"]
    },
    { 
        intervals: [0, 1, 4, 8], 
        name: "minMaj7", 
        rootIndex: 1, 
        notes: ["C", "C#", "E", "G#"],
        rootPositionExample: ["C", "Eb", "G", "B"]
    },
    { 
        intervals: [0, 1, 4, 9], 
        name: "minMaj7#5", 
        rootIndex: 1, 
        notes: ["C", "C#", "E", "A"],
        rootPositionExample: ["C", "Eb", "G#", "B"]
    },
    { 
        intervals: [0, 1, 4, 6], 
        name: "minMaj7add4-omit5", 
        rootIndex: 1, 
        notes: ["C", "C#", "E", "F#"],
        rootPositionExample: ["C", "Eb", "F", "B"]
    },
    { 
        intervals: [0, 1, 2, 4], 
        name: "minMaj7sus*b2-omit5", 
        rootIndex: 1, 
        notes: ["C", "C#", "D", "E"],
        rootPositionExample: ["C", "Db", "Eb", "B"]
    },
    { 
        intervals: [0, 1, 4, 7], 
        name: "dimMaj7", 
        rootIndex: 1, 
        notes: ["C", "C#", "E", "G"],
        rootPositionExample: ["C", "Eb", "Gb", "B"]
    },
    { 
        intervals: [0, 1, 3, 7], 
        name: "dimMaj7sus2", 
        rootIndex: 1, 
        notes: ["C", "C#", "D#", "G"],
        rootPositionExample: ["C", "D", "Gb", "B"]
    },
    { 
        intervals: [0, 3, 6, 9], 
        name: "o7", 
        rootIndex: 0, 
        notes: ["C", "D#", "F#", "A"],
        rootPositionExample: ["C", "Eb", "Gb", "A"]
    },
    { 
        intervals: [0, 1, 2, 3], 
        name: "Cluster", 
        rootIndex: 0, 
        notes: ["C", "C#", "D", "D#"],
        rootPositionExample: ["C", "C#", "D", "D#"]
    }
];

// Initialize localStorage if needed
function initializeStorage() {
    if (!localStorage.getItem('discoveredChords')) {
        localStorage.setItem('discoveredChords', JSON.stringify([]));
    }
}

// Get discovered chords from localStorage
function getDiscoveredChords() {
    return JSON.parse(localStorage.getItem('discoveredChords') || '[]');
}

// Save a newly discovered chord
function saveDiscoveredChord(chordTypeIndex) {
    const discovered = getDiscoveredChords();
    if (!discovered.includes(chordTypeIndex)) {
        discovered.push(chordTypeIndex);
        localStorage.setItem('discoveredChords', JSON.stringify(discovered));
    }
    return discovered;
}

// Clear all discovered chords (for testing/reset)
function clearDiscoveredChords() {
    localStorage.setItem('discoveredChords', JSON.stringify([]));
}

// Initialize storage when the script loads
initializeStorage(); 