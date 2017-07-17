(function (window, document) {
    "use strict";
    console.log(document);

    var interval = 1000, // ms
        expected = Date.now() + interval;

    var minutesDisplay = document.querySelector(".min"),
        secondsDisplay = document.querySelector(".sec");


    // Clock State variables.
    var breaking = false, // Keeps track whether or not clock is currently in session or break.
        active = false; // Used to indicate whether user has started clock.

    var time = setTime("start"),
        timerID, // Keep track of last called timer.
        originalTime = time;

    var timeDisplay = document.querySelector(".time-display");

    updateDisplay();

    timeDisplay.addEventListener("click", toggleClockState);

    // toggleClockState() is used to toggle the clock between active and paused.
    function toggleClockState() {
        if (!active) {
            if (time === 0) {
                return "";
            }
            expected = Date.now() + interval;
            updateDisplay();
            
            // Start timer / Start clock
            timerID = setTimeout(step, interval);
            active = true;
        } else {
            // Cancels the last called setTimeout()
            clearTimeout(timerID);
            active = false;
        }
    }

    // Main timer function.
    function step() {
        var dt = Date.now() - expected; // The drift (positive for overshooting)

        if (dt > interval) {
            console.log("Error in step. dt > interval");
            return new Error("dt > interval");
        }

        // Main timer logic.
        time--;
        updateDisplay();

        // if time equals zero and was last in session. Switch to break.
        if (time === 1 && !breaking) {
            breaking = true;
            time = setTime("break");
            originalTime = time;
        } else if (time === 1 && breaking) { // Was last in break.
            breaking = false;
            time = setTime("session");
            originalTime = time;
        }

        expected += interval;
        timerID = setTimeout(step, Math.max(0, interval - dt)); // Take into account Drift
    }

    function updateDisplay() {
        // Updates the stylesheet since psuedoelements are not accessable through js.
        var backgroundColor = document.styleSheets[0].rules[13].style.backgroundColor;
        var min = (time - (time % 60)) / 60;
        var sec = time % 60;

        // Update minute display.
        if (min >= 10) {
            minutesDisplay.innerText = min;
        } else {
            minutesDisplay.innerText = "0" + min;
        }

        // Update second display.
        if (sec >= 10) {
            secondsDisplay.innerText = sec;
        } else {
            secondsDisplay.innerText = "0" + sec;
        }

        // Only indicate progress when clock is active and not at the time set by user(beginning)
        if (active && time !== originalTime) {
            document.styleSheets[0].cssRules[12].style.top = -(100 - (time / originalTime * 100)) + "%";
        }

        // Update progress background-color.
        // Must access stylesheet directly to manipulate the pseudo element styles.
        if (breaking && backgroundColor !== "orange") {
            document.styleSheets[0].cssRules[13].style.backgroundColor = "hsl(39, 100%, 40%)";
            timeDisplay.style.borderColor = "hsl(39, 100%, 40%)";
        } else if (!breaking && backgroundColor !== "green") {
            document.styleSheets[0].cssRules[13].style.backgroundColor = "hsl(120, 100%, 35%)";
            timeDisplay.style.borderColor = "hsl(120, 100%, 35%)";
        }
    }

    // Caluclates time in seconds depending on whether clock is starting, break or session.
    // state value must be one of the following session, break, start
    function setTime(state) {
        if (state !== "start") {
            return Number(document.querySelector("." + state).innerText) * 60;
        } else if (state === "start") {
            return Number(document.querySelector(".session").innerText) * 60;
        }
    }

    window.changeBreakTime = function changeBreakTime(change) {
        if (!active) {
            var breakTimeDisplay = document.querySelector(".break");

            // Keeps time from going below 0.
            if (Number(breakTimeDisplay.innerText) === 0 && change < 0 || Number(breakTimeDisplay.innerText)+1 > 60) {
                return "";
            }

            breakTimeDisplay.innerText = Number(breakTimeDisplay.innerText) + change;

            // Only update Clock if currently in a break and inactive.
            if (breaking && !active) {
                time = setTime("break");
                originalTime = time;
            }
            updateDisplay();
        }
    }

    window.changeSessionTime = function changeSessionTime(change) {
        // only update the session time if not currently active
        if (!active) {
            var sessionTimeDisplay = document.querySelector(".session");

            // Keep time from going below 0.
            if (Number(sessionTimeDisplay.innerText) === 0 && change < 0 || Number(sessionTimeDisplay.innerText)+1 > 60) {
                return "";
            }
            
            sessionTimeDisplay.innerText = Number(sessionTimeDisplay.innerText) + change;

            // Only update the clock when it isn't in break and inactive.
            if (!breaking && !active) {
                time = setTime("session");
                originalTime = time;
            updateDisplay();
            }
        }
    }

})(window, document);