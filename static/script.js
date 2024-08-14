let currentSong;
let audio = new Audio(); // Create a new Audio object for the custom player
let guessInput = document.getElementById("guess");
let result = document.getElementById("result");
let triesDisplay = document.getElementById("tries");
let playPauseBtn = document.getElementById("playPauseBtn"); // Custom play/pause button
let incorrectGuessesDiv = document.getElementById("incorrectGuesses"); // Div to show incorrect guesses
let suggestionsList = document.getElementById("suggestionsList"); // Suggestions dropdown
let circularProgressBar = document.getElementById("circularProgressBar"); // Circular progress bar



let maxTries = 5;
let currentTry = 0;
let startTime = Math.floor(Math.random() * 120); // Random start time in seconds
let duration = 5;
let isPlaying = false;
let userHasInteracted = false;
let songNames = []; // To store song names


// Fetch songs and set the selected song
fetch('/songs')
    .then(response => response.json())
    .then(data => {
        songNames = data.songs.map(song => song.replace('.mp3', '')); // Strip the .mp3 extension
        if (data.selected_song) {
            currentSong = data.selected_song;
            audio.src = `/songs/${currentSong}`;
        } else {
            result.innerText = "No songs available.";
        }
    });

// Play the song clip
function playClip() {
    if (!userHasInteracted || isPlaying) return; // Ensure the user has interacted and avoid replaying if already playing

    audio.currentTime = startTime;
    audio.play()
        .then(() => {
            isPlaying = true;
            updateProgressBar();
            setTimeout(() => {
                audio.pause();
                isPlaying = false;
                circularProgressBar.style.setProperty('--progress', '0%');
            }, duration * 1000); // Play for 'duration' seconds
        })
        .catch(error => console.error('Playback error:', error));
}

// Toggle play functionality (now only plays the clip)
function togglePlay() {
    userHasInteracted = true; // Mark that the user has interacted
    playClip(); // Play the clip
}

// Show suggestions list when input is focused
guessInput.addEventListener("focus", () => {
    suggestionsList.style.display = "block";
});

guessInput.addEventListener("blur", () => {
    setTimeout(() => {
        suggestionsList.style.display = "none";
    }, 0); // Set to 0 or a minimal value
});

// Click handler for suggestions list items
suggestionsList.addEventListener("mousedown", (event) => {
    if (event.target.classList.contains("suggestionItem")) {
        guessInput.value = event.target.innerText; // Set the input value to the clicked suggestion
        suggestionsList.style.display = "none"; // Hide the suggestions list
    }
});

// Hide suggestions list if clicking outside of the input field and suggestions list
document.addEventListener("click", (event) => {
    if (!guessInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = "none";
    }
});

// Update the circular progress bar
function updateProgressBar() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += (100 / (duration * 1000)) * 100;
        circularProgressBar.style.setProperty('--progress', `${progress}%`);
        if (progress >= 100 || !isPlaying) {
            clearInterval(interval);
        }
    }, 100);
}

// Add event listener to play button
playPauseBtn.addEventListener("click", togglePlay);





// Handle guess submission
document.getElementById("submitGuess").addEventListener("click", function() {
    let guess = guessInput.value.toLowerCase();

    if (currentTry >= maxTries || result.innerText.includes("Correct!")) {
        return; // Prevent more tries after correct guess or if max tries are reached
    }

    currentTry++;

    if (guess === currentSong.replace('.mp3', '').toLowerCase()) {
        result.innerText = `Correct! The song is ${currentSong.replace('.mp3', '')}`;
        guessInput.disabled = true; // Disable input after correct guess
        document.getElementById("submitGuess").disabled = true; // Disable button after correct guess
        displayCorrectGuess(guess);
        audio.pause();
        isPlaying = false;
        triggerConfetti(); // Call confetti function
        
    } else {
        result.innerText = "Incorrect, try again!";
        displayIncorrectGuess(guess);
        duration += 2; // Increase clip duration
        playClip();
    }

    if (currentTry >= maxTries) {
        result.innerText = `Sorry, the song was ${currentSong.replace('.mp3', '')}`;
        audio.pause();
        isPlaying = false;
    }

    triesDisplay.innerText = `Tries left: ${maxTries - currentTry}`;
    guessInput.value = "";
});

// Display incorrect guesses
function displayIncorrectGuess(guess) {
    let guessBox = document.createElement("div");
    guessBox.className = "guessBox incorrect";
    guessBox.innerText = guess;
    incorrectGuessesDiv.appendChild(guessBox);
}

// Display correct guess
function displayCorrectGuess(guess) {
    let guessBox = document.createElement("div");
    guessBox.className = "guessBox correct";
    guessBox.innerText = guess;
    incorrectGuessesDiv.appendChild(guessBox);
}

// Show song suggestions in the dropdown
function showSuggestions(value) {
    suggestionsList.innerHTML = ""; // Clear previous suggestions

    if (value) {
        const filteredSongs = songNames.filter(song =>
            song.toLowerCase().includes(value.toLowerCase())
        );

        filteredSongs.forEach(song => {
            const suggestionItem = document.createElement("div");
            suggestionItem.className = "suggestionItem";
            suggestionItem.innerText = song;
            suggestionItem.addEventListener("click", () => {
                guessInput.value = song;
                suggestionsList.innerHTML = ""; // Clear suggestions after selection
            });
            suggestionsList.appendChild(suggestionItem);
        });
    }
}

// Event listener for input changes in the guess input field
guessInput.addEventListener("input", function() {
    showSuggestions(this.value);
});

// Handle dark mode toggle and preference storage
document.addEventListener('DOMContentLoaded', () => {
    // Check for dark mode preference in localStorage
    if (localStorage.getItem('darkMode') === 'enabled' ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
    }

    // Dark mode toggle button
    const darkModeToggle = document.getElementById('darkModeToggle');
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('darkMode', 'enabled');
        } else {
            localStorage.setItem('darkMode', 'disabled');
        }
    });
});


// Function to trigger confetti
function triggerConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    } else {
        console.error('Confetti function is not available');
    }
}
