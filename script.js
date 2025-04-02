document.getElementById("play-btn").addEventListener("click", () => {
    document.querySelector(".start-screen").style.display = "none";
    document.querySelector(".auth-screen").style.display = "block";
});

document.getElementById("enter-btn").addEventListener("click", () => {
    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();

    if (username && email) {
        fetch("http://localhost/guess-the-banana-new/backend/register.php", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}`
        })
        .then(response => response.json())
        .then(data => {
            console.log("Server response:", data);
            if (data.status === "success") {
                document.querySelector(".auth-screen").style.display = "none";
                document.querySelector(".game-screen").style.display = "block";
                startGame();
            } else {
                alert("Registration failed: " + data.message);
            }
        })
        .catch(error => {
            console.error("Fetch error:", error);
            alert("Error connecting to the server.");
        });
    } else {
        alert("Enter valid details.");
    }
});

// Game Variables
let lives = 3;
let score = 0;
let level = 1;
let timer;
let timerInterval;

function startGame() {
    fetch("http://localhost/guess-the-banana-new/backend/proxy.php")
        .then(response => response.json())
        .then(data => {
            console.log("API Data:", data);

            if (!data.image || !data.solution) {
                alert("API did not return valid data.");
                return;
            }

            // Display question and image
            document.getElementById("banana-img").src = data.image;
            document.getElementById("question").innerText = data.question || "No question available";
            document.getElementById("answer").value = "";

            // Reset Timer
            clearInterval(timerInterval);
            timer = Math.max(10, 100 - (level - 1) * 10); // Reducing 10 sec per level
            document.getElementById("timer").innerText = timer;
            timerInterval = setInterval(updateTimer, 1000);

            // Set event listener for submit button
            document.getElementById("submit-btn").onclick = () => checkAnswer(data.solution);
        })
        .catch(error => {
            console.error("API error:", error);
            alert("Failed to load the puzzle. Try again!");
        });
}

// Timer Countdown
function updateTimer() {
    if (timer > 0) {
        timer--;
        document.getElementById("timer").innerText = timer;
    } else {
        clearInterval(timerInterval);
        lives--;
        document.getElementById("lives").innerText = lives;
        if (lives === 0) {
            startMiniGame();
        } else {
            startGame();
        }
    }
}

// Check Answer Function
function checkAnswer(correctAnswer) {
    let userAnswer = parseInt(document.getElementById("answer").value);

    if (userAnswer === correctAnswer) {
        score += 10;
        level++;
        document.getElementById("level").innerText = level;
        document.getElementById("score").innerText = score;

        if (level > 10) {
            alert("Congratulations! You completed the game.");
        } else {
            startGame();
        }
    } else {
        lives--;
        document.getElementById("lives").innerText = lives;
        if (lives === 0) {
            startMiniGame();
        }
    }
}

// Mini-Game Logic (Banana Shooting)
function startMiniGame() {
    alert("Mini-game time! Click bananas to earn a life.");

    let miniGameContainer = document.createElement("div");
    miniGameContainer.className = "mini-game";
    document.body.appendChild(miniGameContainer);

    let bananas = [];
    for (let i = 0; i < 5; i++) {
        let banana = document.createElement("div");
        banana.className = "banana";
        banana.style.left = `${Math.random() * 80}%`;
        banana.style.top = `${Math.random() * 80}%`;
        banana.onclick = () => {
            miniGameContainer.removeChild(banana);
            bananas.splice(bananas.indexOf(banana), 1);
            if (bananas.length === 0) {
                document.body.removeChild(miniGameContainer);
                lives = 1;
                document.getElementById("lives").innerText = lives;
                startGame();
            }
        };
        miniGameContainer.appendChild(banana);
        bananas.push(banana);
    }

    setTimeout(() => {
        if (document.body.contains(miniGameContainer)) {
            document.body.removeChild(miniGameContainer);
            alert("Mini-game failed! Game over.");
        }
    }, 10000);
}
