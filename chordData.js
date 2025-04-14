// Chord data from unique_chord.txt
const chordTypes = [
    {
        intervals: [0, 4, 7, 11],
        name: "Maj7",
        rootIndex: 0,
        notes: ['C', 'E', 'G', 'B'],
        rootPositionExample: ['C', 'E', 'G', 'B']
    },
    {
        intervals: [0, 4, 8, 11],
        name: "Maj7#5",
        rootIndex: 0,
        notes: ['C', 'E', 'G#', 'B'],
        rootPositionExample: ['C', 'E', 'G#', 'B']
    },
    {
        intervals: [0, 4, 6, 11],
        name: "Maj7b5",
        rootIndex: 0,
        notes: ['C', 'E', 'Gb', 'B'],
        rootPositionExample: ['C', 'E', 'Gb', 'B']
    },
    {
        intervals: [0, 4, 9, 11],
        name: "Maj7add6-omit5",
        rootIndex: 0,
        notes: ['C', 'E', 'A', 'B'],
        rootPositionExample: ['C', 'E', 'A', 'B']
    },
    {
        intervals: [0, 2, 4, 11],
        name: "Maj7add2-omit5",
        rootIndex: 0,
        notes: ['C', 'D', 'E', 'B'],
        rootPositionExample: ['C', 'D', 'E', 'B']
    },
    {
        intervals: [0, 3, 4, 11],
        name: "Maj7add*#2-omit5",
        rootIndex: 0,
        notes: ['C', 'D#', 'E', 'B'],
        rootPositionExample: ['C', 'D#', 'E', 'B']
    },
    {
        intervals: [0, 6, 7, 11],
        name: "Maj7add#11-omit3",
        rootIndex: 0,
        notes: ['C', 'F#', 'G', 'B'],
        rootPositionExample: ['C', 'F#', 'G', 'B']
    },
    {
        intervals: [0, 1, 6, 11],
        name: "Maj7b5sus*b2",
        rootIndex: 0,
        notes: ['C', 'Db', 'Gb', 'B'],
        rootPositionExample: ['C', 'Db', 'Gb', 'B']
    },
    {
        intervals: [0, 7, 9, 11],
        name: "Maj7add6-omit3",
        rootIndex: 0,
        notes: ['C', 'G', 'A', 'B'],
        rootPositionExample: ['C', 'G', 'A', 'B']
    },
    {
        intervals: [0, 8, 9, 11],
        name: "Maj7#5add6-omit3",
        rootIndex: 0,
        notes: ['C', 'G#', 'A', 'B'],
        rootPositionExample: ['C', 'G#', 'A', 'B']
    },
    {
        intervals: [0, 3, 7, 10],
        name: "-7",
        rootIndex: 0,
        notes: ['C', 'Eb', 'G', 'Bb'],
        rootPositionExample: ['C', 'Eb', 'G', 'Bb']
    },
    {
        intervals: [0, 3, 8, 10],
        name: "-7#5",
        rootIndex: 0,
        notes: ['C', 'Eb', 'G#', 'Bb'],
        rootPositionExample: ['C', 'Eb', 'G#', 'Bb']
    },
    {
        intervals: [0, 3, 6, 10],
        name: "-7b5",
        rootIndex: 0,
        notes: ['C', 'Eb', 'Gb', 'Bb'],
        rootPositionExample: ['C', 'Eb', 'Gb', 'Bb']
    },
    {
        intervals: [0, 1, 3, 10],
        name: "-7add*b2-omit5",
        rootIndex: 0,
        notes: ['C', 'Db', 'Eb', 'Bb'],
        rootPositionExample: ['C', 'Db', 'Eb', 'Bb']
    },
    {
        intervals: [0, 4, 7, 10],
        name: "7",
        rootIndex: 0,
        notes: ['C', 'E', 'G', 'Bb'],
        rootPositionExample: ['C', 'E', 'G', 'Bb']
    },
    {
        intervals: [0, 4, 8, 10],
        name: "7#5",
        rootIndex: 0,
        notes: ['C', 'E', 'G#', 'Bb'],
        rootPositionExample: ['C', 'E', 'G#', 'Bb']
    },
    {
        intervals: [0, 4, 6, 10],
        name: "7b5",
        rootIndex: 0,
        notes: ['C', 'E', 'Gb', 'Bb'],
        rootPositionExample: ['C', 'E', 'Gb', 'Bb']
    },
    {
        intervals: [0, 1, 4, 10],
        name: "7add*b2-omit5",
        rootIndex: 0,
        notes: ['C', 'Db', 'E', 'Bb'],
        rootPositionExample: ['C', 'Db', 'E', 'Bb']
    },
    {
        intervals: [0, 1, 7, 10],
        name: "7sus*b2",
        rootIndex: 0,
        notes: ['C', 'Db', 'G', 'Bb'],
        rootPositionExample: ['C', 'Db', 'G', 'Bb']
    },
    {
        intervals: [0, 1, 6, 10],
        name: "7b5sus*b2",
        rootIndex: 0,
        notes: ['C', 'Db', 'Gb', 'Bb'],
        rootPositionExample: ['C', 'Db', 'Gb', 'Bb']
    },
    {
        intervals: [0, 2, 7, 10],
        name: "7sus2",
        rootIndex: 0,
        notes: ['C', 'D', 'G', 'Bb'],
        rootPositionExample: ['C', 'D', 'G', 'Bb']
    },
    {
        intervals: [0, 2, 8, 10],
        name: "7#5sus2",
        rootIndex: 0,
        notes: ['C', 'D', 'G#', 'Bb'],
        rootPositionExample: ['C', 'D', 'G#', 'Bb']
    },
    {
        intervals: [0, 5, 7, 10],
        name: "7sus4",
        rootIndex: 0,
        notes: ['C', 'F', 'G', 'Bb'],
        rootPositionExample: ['C', 'F', 'G', 'Bb']
    },
    {
        intervals: [0, 1, 7, 11],
        name: "Maj7sus*b2",
        rootIndex: 0,
        notes: ['C', 'Db', 'G', 'B'],
        rootPositionExample: ['C', 'Db', 'G', 'B']
    },
    {
        intervals: [0, 1, 5, 11],
        name: "Maj7sus*b2-omit5",
        rootIndex: 0,
        notes: ['C', 'Db', 'F', 'B'],
        rootPositionExample: ['C', 'Db', 'F', 'B']
    },
    {
        intervals: [0, 1, 6, 11],
        name: "Maj7sus*b2&4-omit5",
        rootIndex: 0,
        notes: ['C', 'Db', 'F#', 'B'],
        rootPositionExample: ['C', 'Db', 'F#', 'B']
    },
    {
        intervals: [0, 1, 9, 11],
        name: "Maj7sus*b2add6-omit5",
        rootIndex: 0,
        notes: ['C', 'Db', 'A', 'B'],
        rootPositionExample: ['C', 'Db', 'A', 'B']
    },
    {
        intervals: [0, 1, 8, 11],
        name: "Maj7#5sus*b2",
        rootIndex: 0,
        notes: ['C', 'Db', 'G#', 'B'],
        rootPositionExample: ['C', 'Db', 'G#', 'B']
    },
    {
        intervals: [0, 2, 7, 11],
        name: "Maj7sus2",
        rootIndex: 0,
        notes: ['C', 'D', 'G', 'B'],
        rootPositionExample: ['C', 'D', 'G', 'B']
    },
    {
        intervals: [0, 2, 8, 11],
        name: "Maj7#5sus2",
        rootIndex: 0,
        notes: ['C', 'D', 'G#', 'B'],
        rootPositionExample: ['C', 'D', 'G#', 'B']
    },
    {
        intervals: [0, 2, 5, 11],
        name: "Maj7sus2&4",
        rootIndex: 0,
        notes: ['C', 'D', 'F', 'B'],
        rootPositionExample: ['C', 'D', 'F', 'B']
    },
    {
        intervals: [0, 5, 7, 11],
        name: "Maj7sus4",
        rootIndex: 0,
        notes: ['C', 'F', 'G', 'B'],
        rootPositionExample: ['C', 'F', 'G', 'B']
    },
    {
        intervals: [0, 5, 8, 11],
        name: "Maj7#5sus4",
        rootIndex: 0,
        notes: ['C', 'F', 'G#', 'B'],
        rootPositionExample: ['C', 'F', 'G#', 'B']
    },
    {
        intervals: [0, 5, 6, 11],
        name: "Maj7b5sus4",
        rootIndex: 0,
        notes: ['C', 'F', 'Gb', 'B'],
        rootPositionExample: ['C', 'F', 'Gb', 'B']
    },
    {
        intervals: [0, 3, 7, 11],
        name: "minMaj7",
        rootIndex: 0,
        notes: ['C', 'Eb', 'G', 'B'],
        rootPositionExample: ['C', 'Eb', 'G', 'B']
    },
    {
        intervals: [0, 3, 8, 11],
        name: "minMaj7#5",
        rootIndex: 0,
        notes: ['C', 'Eb', 'G#', 'B'],
        rootPositionExample: ['C', 'Eb', 'G#', 'B']
    },
    {
        intervals: [0, 3, 5, 11],
        name: "minMaj7add4-omit5",
        rootIndex: 0,
        notes: ['C', 'Eb', 'F', 'B'],
        rootPositionExample: ['C', 'Eb', 'F', 'B']
    },
    {
        intervals: [0, 1, 3, 11],
        name: "minMaj7sus*b2-omit5",
        rootIndex: 0,
        notes: ['C', 'Db', 'Eb', 'B'],
        rootPositionExample: ['C', 'Db', 'Eb', 'B']
    },
    {
        intervals: [0, 3, 6, 11],
        name: "dimMaj7",
        rootIndex: 0,
        notes: ['C', 'Eb', 'Gb', 'B'],
        rootPositionExample: ['C', 'Eb', 'Gb', 'B']
    },
    {
        intervals: [0, 2, 6, 11],
        name: "dimMaj7sus2",
        rootIndex: 0,
        notes: ['C', 'D', 'Gb', 'B'],
        rootPositionExample: ['C', 'D', 'Gb', 'B']
    },
    {
        intervals: [0, 3, 6, 9],
        name: "o7",
        rootIndex: 0,
        notes: ['C', 'Eb', 'Gb', 'A'],
        rootPositionExample: ['C', 'Eb', 'Gb', 'A']
    },
    {
        intervals: [0, 1, 2, 3],
        name: "Cluster",
        rootIndex: 0,
        notes: ['C', 'C#', 'D', 'D#'],
        rootPositionExample: ['C', 'C#', 'D', 'D#']
    },
    {
        intervals: [0, 6, 8, 11],
        name: "Maj7b5-omit3",
        rootIndex: 0,
        notes: ['C', 'Gb', 'G#', 'B'],
        rootPositionExample: ['C', 'Gb', 'G#', 'B']
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
        console.log('Added chord to discoveries:', chordTypeIndex);
    } else {
        console.log('Chord already discovered:', chordTypeIndex);
    }
    return discovered;
}

// Clear all discovered chords (for testing/reset)
function clearDiscoveredChords() {
    localStorage.setItem('discoveredChords', JSON.stringify([]));
}

// Add a temporary function to force discover a chord (for testing)
function forceDiscoverChord(index) {
    console.log('Force discovering chord index:', index);
    return saveDiscoveredChord(index);
}

// Initialize storage when the script loads
initializeStorage();
