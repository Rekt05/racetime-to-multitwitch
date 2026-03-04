const input = document.getElementById('input');
const output = document.getElementById('output');
const pasteBtn = document.getElementById('paste');
const copyBtn = document.getElementById('copy');
const convBtn = document.getElementById('convert');
let players = [];
async function getStreams() {
    const rawUrl = input.value.trim();
    if (!rawUrl)
        return;
    const url = rawUrl.endsWith('/data') ? rawUrl : `${rawUrl}/data`;
    try {
        const response = await fetch(url);
        if (!response.ok)
            throw new Error();
        const data = await response.json();
        if (data.entrants && Array.isArray(data.entrants)) {
            players = data.entrants
                .filter((item) => item.user && item.user.twitch_name)
                .map((item) => item.user.twitch_name);
            performConversion();
        }
    }
    catch (err) {
        output.value = "Invalid Link / Error Fetching Data";
    }
}
function performConversion() {
    const mtBase = "https://multitwitch.tv/";
    const pStr = players.join('/');
    output.value = "";
    output.value = mtBase + pStr;
}
convBtn.addEventListener('click', async () => {
    output.value = "Loading...";
    convBtn.textContent = "Clicked";
    setTimeout(() => (convBtn.textContent = "Convert"), 1000);
    await getStreams();
});
pasteBtn.addEventListener('click', async () => {
    output.value = "Loading...";
    pasteBtn.textContent = "Pasted";
    setTimeout(() => (pasteBtn.textContent = "Paste"), 1000);
    input.value = await navigator.clipboard.readText();
    await getStreams();
});
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(output.value);
    copyBtn.textContent = "Copied";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1000);
});
export {};
//# sourceMappingURL=scripts.js.map