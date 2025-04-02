document.addEventListener("DOMContentLoaded", () => {
    const playButton = document.getElementById("play-btn");
    const startScreen = document.querySelector(".start-screen");
    const authScreen = document.querySelector(".auth-screen");
    const gameScreen = document.querySelector(".game-screen");

    if (playButton) {
        playButton.addEventListener("click", () => {
            startScreen.classList.add("hidden");
            authScreen.classList.remove("hidden");
        });
    }

    const enterButton = document.getElementById("enter-btn");
    if (enterButton) {
        enterButton.addEventListener("click", () => {
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
                    if (data.status === "success") {
                        authScreen.classList.add("hidden");
                        gameScreen.classList.remove("hidden");
                        startGame(true); 
                    } else {
                        showNotification("Registration failed: " + data.message);
                    }
                })
                .catch(error => console.error("Error connecting to server:", error));
            } else {
                showNotification("Enter valid details.");
            }
        });
    }

    // Game Variables
    let lives = parseInt(localStorage.getItem("lives")) || 3;
    let score = parseInt(localStorage.getItem("score")) || 0;
    let level = parseInt(localStorage.getItem("level")) || 1;
    let timer;
    let timerInterval;

    function startGame(reset = false) {
        if (reset) {
            lives = 3;
            level = 1;
            score = 0;
            localStorage.setItem("lives", lives);
            localStorage.setItem("level", level);
            localStorage.setItem("score", score);
        }

        document.getElementById("lives").innerText = lives;
        document.getElementById("score").innerText = score;
        document.getElementById("level").innerText = level;

        fetch("http://localhost/guess-the-banana-new/backend/proxy.php")
            .then(response => response.json())
            .then(data => {
                console.log("Question: ", data.question);
                console.log("Solution: ", data.solution);

                if (!data.image || data.solution === undefined) {
                    showNotification("API did not return valid data.");
                    return;
                }

                gameScreen.classList.remove("hidden");
                let imgElement = document.getElementById("banana-img");
                imgElement.src = data.image + "?t=" + new Date().getTime();

                document.getElementById("question").innerText = "Solve the equation!";
                document.getElementById("answer").value = "";

                clearInterval(timerInterval);
                timer = Math.max(10, 100 - (level - 1) * 10);
                document.getElementById("timer").innerText = timer;
                timerInterval = setInterval(updateTimer, 1000);

                document.getElementById("submit-btn").onclick = () => checkAnswer(data.solution);
            })
            .catch(error => {
                console.error("Failed to load puzzle:", error);
                showNotification("Failed to load puzzle.");
            });
    }

    function updateTimer() {
        if (timer > 0) {
            timer--;
            document.getElementById("timer").innerText = timer;
        } else {
            clearInterval(timerInterval);
            loseLife(true);
        }
    }

    function checkAnswer(correctAnswer) {
        let userAnswer = parseInt(document.getElementById("answer").value);

        if (userAnswer === correctAnswer) {
            score += 10;
            level++;
            localStorage.setItem("score", score);
            localStorage.setItem("level", level);
            document.getElementById("level").innerText = level;
            document.getElementById("score").innerText = score;

            if (level > 10) {
                showNotification("Congratulations! You completed the game.");
            } else {
                startGame();
            }
        } else {
            loseLife(false);
        }
    }

    function loseLife(timeExpired) {
        lives--;
        if (lives < 0) lives = 0;
        localStorage.setItem("lives", lives);
        document.getElementById("lives").innerText = lives;

        if (lives <= 0) {
            showNotification("Mini-game: Play to regain a life!");
            setTimeout(() => {
                localStorage.setItem("level", level);
                window.location.href = "mini-game.html";
            }, 2000);
        } else {
            if (timeExpired) {
                timer = Math.max(10, 100 - (level - 1) * 10);
            }
            startGame();
        }
    }

    // Mini-Game Handling
    if (window.location.pathname.includes("mini-game.html")) {
        let miniTimer = 10;
        let miniTimerElement = document.getElementById("mini-timer");

        if (miniTimerElement) {
            let miniTimerInterval = setInterval(() => {
                miniTimer--;
                miniTimerElement.innerText = miniTimer;

                if (miniTimer <= 0) {
                    clearInterval(miniTimerInterval);
                    showNotification("Mini-Game Over! Redirecting...");
                    setTimeout(() => {
                        window.location.href = "highscore.html";
                    }, 2000);
                }
            }, 1000);
        }

        const floatingBanana = document.getElementById("floating-banana");
        if (floatingBanana) {
            floatingBanana.addEventListener("click", () => {
                showNotification("You won the mini-game! Life restored.");
                localStorage.setItem("lives", 1);
                setTimeout(() => {
                    window.location.href = "index.html?continue=true";
                }, 2000);
            });
        }
    }

    function showNotification(message) {
        let notification = document.createElement("div");
        notification.className = "notification";
        notification.innerText = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    if (window.location.search.includes("continue=true")) {
        authScreen.classList.add("hidden");
        startScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");
        lives = 1;
        startGame(false);
    }
});
