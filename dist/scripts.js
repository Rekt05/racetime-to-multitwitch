const input = document.getElementById("input");
const output = document.getElementById("output");
const pasteBtn = document.getElementById("paste");
const copyBtn = document.getElementById("copy");
const convBtn = document.getElementById("convert");
const toggleBtn = document.getElementById("toggle-ui");
const toggleText = document.getElementById("toggle-text");
const autoScreen = document.getElementById("automatic-screen");
const manualScreen = document.getElementById("manual-screen");
const dynamicContainer = document.getElementById("dynamic-outputs-container");
const gameDropdown = document.getElementById("game-dropdown");
const includeFinishedCheck = document.getElementById('include-finished');
const rtBase = "https://racetime.gg";
const mtBase = "https://multitwitch.tv/";
let allCategories = [];
toggleBtn.addEventListener("click", () => {
    const isAuto = autoScreen.style.display !== "none";
    if (isAuto) {
        autoScreen.style.display = "none";
        manualScreen.style.display = "flex";
        toggleText.textContent = "Switch to Automatic Mode";
    }
    else {
        manualScreen.style.display = "none";
        autoScreen.style.display = "flex";
        toggleText.textContent = "Switch to Manual Mode";
        getLobbies();
    }
});
async function getStreams(fullDataUrl) {
    try {
        const response = await fetch(fullDataUrl);
        const data = await response.json();
        if (data.entrants && Array.isArray(data.entrants)) {
            const list = data.entrants
                .filter((item) => {
                const hasTwitch = item.user && item.user.twitch_name;
                const isFinished = item.status.value === 'done';
                if (!includeFinishedCheck.checked && isFinished) {
                    return false;
                }
                return hasTwitch;
            })
                .map((item) => item.user.twitch_name);
            return list.length > 0
                ? `${mtBase}${list.join("/")}`
                : "No Twitch links found";
        }
        return "No entrants found";
    }
    catch {
        return "Error fetching data";
    }
}
async function populateCategories() {
    try {
        const response = await fetch("./games/games.json");
        const data = await response.json();
        allCategories = data.categories || data;
        const savedGame = localStorage.getItem("lastSelectedGame") || "hitman-3";
        gameDropdown.innerHTML = "";
        allCategories.forEach((game) => {
            const option = document.createElement("option");
            option.value = game.slug;
            option.textContent = game.name;
            if (game.slug === savedGame)
                option.selected = true;
            gameDropdown.appendChild(option);
        });
        const savedIncludeFinished = localStorage.getItem("includeFinished") === "true";
        includeFinishedCheck.checked = savedIncludeFinished;
        getLobbies();
    }
    catch (err) {
        console.error("Error populating dropdown:", err);
    }
}
async function getLobbies() {
    const selectedSlug = gameDropdown.value;
    const selectedGame = allCategories.find((g) => g.slug === selectedSlug);
    if (!selectedGame)
        return;
    const lobbyUrl = `${rtBase}${selectedGame.data_url}`;
    try {
        const response = await fetch(lobbyUrl);
        const data = await response.json();
        renderLobbies(data.current_races);
    }
    catch (err) {
        dynamicContainer.innerHTML = `<div class="lobby-desc">Error loading lobbies</div>`;
    }
}
async function renderLobbies(races) {
    dynamicContainer.innerHTML = "";
    if (races.length === 0) {
        dynamicContainer.innerHTML = `<div class="lobby-desc">No active races found</div>`;
        return;
    }
    for (const race of races) {
        const lobbyBox = document.createElement("div");
        lobbyBox.className = "output-item";
        const mtLink = await getStreams(`${rtBase}${race.data_url}`);
        lobbyBox.innerHTML = `
            <span class="lobby-desc">
                ${race.goal.name} - ${race.entrants_count} entrants (${race.entrants_count_finished} finished) - 
                ${race.status.verbose_value} -
                <a href="${rtBase}${race.url}" target="_blank" rel="noopener noreferrer">${rtBase}${race.url}</a>
                
            </span>
            <div class="output">
                <input type="text" readonly value="${mtLink}">
                <button class="copy-btn">Copy</button>
            </div>
        `;
        const btn = lobbyBox.querySelector(".copy-btn");
        const inp = lobbyBox.querySelector("input");
        btn.addEventListener("click", () => {
            navigator.clipboard.writeText(inp.value);
            btn.textContent = "Copied";
            setTimeout(() => (btn.textContent = "Copy"), 1000);
        });
        dynamicContainer.appendChild(lobbyBox);
    }
}
convBtn.addEventListener("click", async () => {
    output.value = "Loading...";
    const rawUrl = input.value.trim();
    if (!rawUrl)
        return;
    const dataUrl = rawUrl.endsWith("/data") ? rawUrl : `${rawUrl}/data`;
    output.value = await getStreams(dataUrl);
});
pasteBtn.addEventListener("click", async () => {
    input.value = await navigator.clipboard.readText();
    convBtn.click();
});
copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(output.value);
    copyBtn.textContent = "Copied";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1000);
});
includeFinishedCheck.addEventListener('change', () => {
    localStorage.setItem("includeFinished", includeFinishedCheck.checked.toString());
    const isAuto = autoScreen.style.display !== 'none';
    if (isAuto) {
        getLobbies();
    }
});
gameDropdown.addEventListener("change", () => {
    localStorage.setItem("lastSelectedGame", gameDropdown.value);
    getLobbies();
});
populateCategories();
export {};
//# sourceMappingURL=scripts.js.map