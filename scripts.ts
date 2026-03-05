const input = document.getElementById("input") as HTMLInputElement;
const output = document.getElementById("output") as HTMLInputElement;
const pasteBtn = document.getElementById("paste") as HTMLButtonElement;
const copyBtn = document.getElementById("copy") as HTMLButtonElement;
const convBtn = document.getElementById("convert") as HTMLButtonElement;
const toggleBtn = document.getElementById("toggle-ui") as HTMLDivElement;
const toggleText = document.getElementById("toggle-text") as HTMLSpanElement;
const autoScreen = document.getElementById(
  "automatic-screen",
) as HTMLDivElement;
const manualScreen = document.getElementById("manual-screen") as HTMLDivElement;
const dynamicContainer = document.getElementById(
  "dynamic-outputs-container",
) as HTMLDivElement;
const gameDropdown = document.getElementById(
  "game-dropdown",
) as HTMLSelectElement;

const rtBase = "https://racetime.gg";
const mtBase = "https://multitwitch.tv/";
let allCategories: GameCategory[] = [];

interface Entrant {
  user: { twitch_name: string };
}
interface GameCategory {
  name: string;
  slug: string;
  data_url: string;
}
interface Race {
  name: string;
  url: string;
  data_url: string;
  goal: { name: string };
  entrants_count: number;
  status: { value: string; verbose_value: string; help_text: string };
}

toggleBtn.addEventListener("click", () => {
  const isAuto = autoScreen.style.display !== "none";
  if (isAuto) {
    autoScreen.style.display = "none";
    manualScreen.style.display = "flex";
    toggleText.textContent = "Switch to Automatic Mode";
  } else {
    manualScreen.style.display = "none";
    autoScreen.style.display = "flex";
    toggleText.textContent = "Switch to Manual Mode";
    getLobbies();
  }
});

async function getStreams(fullDataUrl: string): Promise<string> {
  try {
    const response = await fetch(fullDataUrl);
    const data = await response.json();

    if (data.entrants && Array.isArray(data.entrants)) {
      const list = data.entrants
        .filter((item: Entrant) => item.user && item.user.twitch_name)
        .map((item: Entrant) => item.user.twitch_name);

      return list.length > 0
        ? `${mtBase}${list.join("/")}`
        : "No Twitch links found";
    }
    return "No entrants found";
  } catch {
    return "Error fetching data";
  }
}

async function populateCategories() {
  try {
    const response = await fetch("./games/games.json");
    const data = await response.json();

    allCategories = data.categories || data;

    gameDropdown.innerHTML = "";
    allCategories.forEach((game) => {
      const option = document.createElement("option");
      option.value = game.slug;
      option.textContent = game.name;
      if (game.slug === "hitman-3") option.selected = true;
      gameDropdown.appendChild(option);
    });

    getLobbies();
  } catch (err) {
    console.error("Error populating dropdown:", err);
  }
}

async function getLobbies() {
  const selectedSlug = gameDropdown.value;
  const selectedGame = allCategories.find((g) => g.slug === selectedSlug);
  if (!selectedGame) return;

  const lobbyUrl = `${rtBase}${selectedGame.data_url}`;

  try {
    const response = await fetch(lobbyUrl);
    const data = await response.json();
    renderLobbies(data.current_races);
  } catch (err) {
    dynamicContainer.innerHTML = `<div class="lobby-desc">Error loading lobbies</div>`;
  }
}

async function renderLobbies(races: Race[]) {
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
                ${race.goal.name} - ${race.entrants_count} entrants - 
                ${race.status.verbose_value} -
                <a href="${rtBase}${race.url}" target="_blank" rel="noopener noreferrer">${rtBase}${race.url}</a>
                
            </span>
            <div class="output">
                <input type="text" readonly value="${mtLink}">
                <button class="copy-btn">Copy</button>
            </div>
        `;

    const btn = lobbyBox.querySelector(".copy-btn") as HTMLButtonElement;
    const inp = lobbyBox.querySelector("input") as HTMLInputElement;
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
  if (!rawUrl) return;
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

gameDropdown.addEventListener("change", getLobbies);
populateCategories();