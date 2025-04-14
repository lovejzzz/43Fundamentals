# 43 Fundamentals - Four-Note Chord Discovery

A web-based application that allows musicians to explore and discover the 43 fundamental four-note chord types in music theory.

*Created by Tian Xing, who discovered the mathematical foundation of these 43 fundamental chord types and wanted to share this knowledge with the world.*

## Features

- Input any 4 music notes to identify the chord type
- Track which of the 43 fundamental chord types you've discovered
- View detailed information about each chord including intervals and example notes
- Progress tracking saved in your browser's local storage
- Reset option to start your discovery journey from scratch

## How to Use

1. Open `index.html` in a web browser (preferably using a local web server)
2. Select 4 notes using the dropdown menus
3. Click "Identify" to analyze the chord
4. The result will show the chord type, standard name, and notes in root position
5. If the chord matches one of the 43 fundamental types, it will be added to your discovered list
6. Try to discover all 43 chord types!

## Why 43 Chord Types?

### Mathematical Derivation

The number 43 is not arbitrary but mathematically derived using group theory concepts. Here's how we arrive at this number:

#### Step 1: Define the Problem
We're working with a chromatic scale of 12 pitch classes (C, C#, D, etc.), and a 4-note chord is a set of 4 distinct pitch classes. Two chords are considered the same type if one can be transposed to match the other, meaning they share the same intervallic structure.

Total 4-note sets: The number of ways to choose 4 distinct pitch classes from 12 is the binomial coefficient: 

(12 choose 4) = 12!/(4!(12-4)!) = (12 × 11 × 10 × 9)/(4 × 3 × 2 × 1) = 495

This counts each chord without regard to transposition. We need to group these into equivalence classes based on their intervallic patterns.

#### Step 2: Mathematical Approach
Since transposition defines an equivalence relation, we're counting the number of orbits of 4-element subsets under the action of the transposition group (cyclic group of order 12).

We use Burnside's Lemma, which states that the number of distinct orbits is the average number of elements fixed by each group element:

Number of orbits = (1/|G|) × sum of |Fix(g)| for all g in G

Where |G| = 12 (the order of the transposition group) and Fix(g) is the set of 4-element subsets that remain unchanged when transposed by g.

#### Step 3: Compute Fixed Sets
For each transposition Tk (k = 0,1,...,11), we calculate how many 4-element sets remain unchanged:

- T0 (identity): All 495 possible 4-note sets are fixed
- T1, T5, T7, T11: 0 sets fixed (gcd(k,12) = 1)
- T2, T10: 0 sets fixed (gcd(k,12) = 2)
- T3, T9: 3 sets fixed each (gcd(k,12) = 3)
- T4, T8: 0 sets fixed (gcd(k,12) = 4)
- T6: 15 sets fixed (gcd(k,12) = 6)

#### Step 4: Apply Burnside's Lemma
Sum the number of fixed sets across all group elements:

495 + 0 + 0 + 3 + 0 + 0 + 15 + 0 + 0 + 3 + 0 + 0 = 516

Number of distinct chord types = 516/12 = 43

#### Step 5: Interpretation
The calculation shows there are exactly 43 distinct 4-note chord types under transposition in a 12-tone system. Each type corresponds to a unique intervallic structure, invariant under shifts. For example, a major 7th chord (C-E-G-B) is one type, and all its transpositions (D-F#-A-C#, etc.) belong to the same type.

## Technical Implementation

### Core Data Structures

The application uses three main data structures:

1. **chordTypes** (in chordData.js): 
   - Array of 43 chord objects in a specific order defined by order.txt
   - Each chord contains:
     - `intervals`: Semitone distances from the root
     - `name`: The chord name (e.g., "Maj7", "7b5sus*b2")
     - `rootIndex`: Position of the root note in the chord
     - `notes`: Example notes in this chord
     - `rootPositionExample`: Notes arranged in standard root position

2. **chordMappings** (loaded from chord_mapping.txt):
   - Maps all possible note combinations to their chord types 
   - Contains 495 unique note combinations and their corresponding:
     - Chord names (e.g., "C Maj7")
     - Root positions (proper note ordering)
     - Chord types matching those in chordTypes

3. **localStorage**:
   - Stores user progress as an array of discovered chord indices
   - Used to persist the discovery state between sessions

### Chord Identification Method

The application identifies chords using this process:

1. **Note Collection**: Get the four notes selected by the user.

2. **Normalized Lookup**: 
   - Sort the notes alphabetically to create a standardized key
   - Look up this key in the `chordMappings` object
   - This mapping contains all 495 possible four-note combinations

3. **Root Position Identification**:
   - For any identified chord, we determine its proper root position from chord_mapping.txt
   - The chord's notes are reordered to show the root note first, followed by other notes in their proper positions
   - This ensures consistent display of chord structures (e.g., D7 always shows as D, F#, A, C)

4. **Chord Type Matching**:
   - Match the chord type from mapping to one of the 43 chord types in chordTypes array
   - Uses both exact and normalized matching to handle special characters and formatting differences

5. **Discovery Tracking**:
   - Save the chord index in localStorage when discovered
   - Update the UI to show progress and highlight newly discovered chords

### Chord Order

The order of chord types displayed in the "Your Discovery" grid is specified in `order.txt`, which contains all 43 chord types in a specific pedagogical sequence. The chord display follows this order exactly.

### Fallback Mechanisms

- When opening the file directly without a web server, the application uses hardcoded chord mappings as a fallback
- If a chord's root position can't be determined from the mappings, it falls back to interval-based sorting

## For Future Developers

If you need to modify or extend this application:

1. **Adding/Modifying Chord Types**:
   - Update the `chordTypes` array in `chordData.js`
   - Update `order.txt` to reflect the desired display order
   - Regenerate `chord_mapping.txt` if necessary

2. **Changing Chord Ordering**:
   - Modify `order.txt` to change the order in which chords appear
   - The application will automatically use this order for displaying chords

3. **Improving Chord Identification**:

---

## Changelog

### v0.2 (2025-04-14)
- **Animated UI & Visual Polish:**
  - Chord cards, badges, buttons, and progress bar now feature smooth animations and transitions for a delightful user experience.
  - "New Discovery!" badge has a shining effect and is fully non-selectable.
- **Auto-Scroll to New Chord:**
  - When you discover a new chord, the "Your Discovery" grid automatically scrolls to center the new chord card in view.
- **Bug Fixes & Usability:**
  - Fixed bounce animation for new chords (no double trigger).
  - Fixed issue where new chords appeared visually empty in the grid.
  - Improved DOM timing to ensure reliable updates.
  - Improved accessibility and pointer behavior for badges.
- **Other Improvements:**
  - Code and CSS refactoring for maintainability.
  - README and documentation updates.

---

   - The core identification logic is in the `identifyChord()` function
   - The note reordering logic is in `reorderNotesToRootPosition()`
   - Both rely on the comprehensive mapping in `chord_mapping.txt`

4. **Understanding Data Flow**:
   - User input → Normalized note combination
   - Lookup in chord_mapping.txt → Get chord type and root position
   - Find corresponding chord in chordTypes
   - Display properly ordered notes and save discovery

## License

This project is open source and available for educational purposes. 