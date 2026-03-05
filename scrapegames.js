const fs = require('fs');
const path = require('path');

async function run() {
    const out_dir = './games';
    const out_file = 'games.json';

    if (!fs.existsSync(out_dir)) {
        fs.mkdirSync(out_dir);
    }

    const url = "https://racetime.gg/categories/data";
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();

        fs.writeFileSync(
            path.join(out_dir, out_file),
            JSON.stringify(data, null, 2)
        );
        console.log("file saving success");

    } catch (err) {
        console.error("error:", err.message);
        process.exit(1);
    }
}

run();