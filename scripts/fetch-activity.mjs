// Fetches public activity data from GitHub and Hugging Face at build time and
// writes it to src/data/activity.json. Runs automatically via the `prebuild`
// npm script. If a request fails, the existing committed activity.json is kept
// so the build never breaks when an upstream API is down.
//
// Refresh manually with: npm run refresh-activity

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../src/data/activity.json');

const GITHUB_USER = 'MLeggiero';
const HF_USER = 'MLeggiero';
const TIMEOUT_MS = 15000;

async function getJSON(url) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(url, {
            headers: { Accept: 'application/json', 'User-Agent': 'portfolio-website' },
            signal: controller.signal,
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
        return await res.json();
    } finally {
        clearTimeout(timer);
    }
}

async function main() {
    const [contrib, ghUser, hfOverview] = await Promise.all([
        getJSON(`https://github-contributions-api.jogruber.de/v4/${GITHUB_USER}?y=last`),
        getJSON(`https://api.github.com/users/${GITHUB_USER}`),
        getJSON(`https://huggingface.co/api/users/${HF_USER}/overview`),
    ]);

    const data = {
        generatedAt: new Date().toISOString(),
        github: {
            username: GITHUB_USER,
            totalLastYear: contrib?.total?.lastYear ?? 0,
            publicRepos: ghUser?.public_repos ?? 0,
            followers: ghUser?.followers ?? 0,
            // Flat list of { date, count, level } for the last ~year.
            contributions: Array.isArray(contrib?.contributions) ? contrib.contributions : [],
        },
        huggingface: {
            username: HF_USER,
            fullname: hfOverview?.fullname ?? '',
            bio: hfOverview?.details ?? '',
            models: hfOverview?.numModels ?? 0,
            datasets: hfOverview?.numDatasets ?? 0,
            spaces: hfOverview?.numSpaces ?? 0,
        },
    };

    await mkdir(dirname(OUT), { recursive: true });
    await writeFile(OUT, JSON.stringify(data, null, 2) + '\n');
    console.log(
        `[fetch-activity] wrote ${OUT} — GitHub: ${data.github.totalLastYear} contributions, ` +
            `${data.github.publicRepos} repos; HF: ${data.huggingface.models} models, ${data.huggingface.datasets} datasets`,
    );
}

main().catch(async (err) => {
    console.warn(`[fetch-activity] fetch failed (${err.message}); keeping existing activity.json`);
    // Confirm a usable fallback exists; if not, fail loudly so the build surfaces it.
    try {
        await readFile(OUT);
    } catch {
        console.error('[fetch-activity] no existing activity.json fallback found — aborting build');
        process.exit(1);
    }
});
