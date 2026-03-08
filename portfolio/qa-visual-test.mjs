import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const VIEWPORTS = [
    { name: 'mobile-375', width: 375, height: 812 },
    { name: 'tablet-768', width: 768, height: 1024 },
    { name: 'desktop-1024', width: 1024, height: 768 },
    { name: 'desktop-1440', width: 1440, height: 900 },
];

const SECTIONS = ['hero', 'about', 'journey', 'projects', 'skills', 'contact'];

async function run() {
    mkdirSync('qa-screenshots', { recursive: true });
    const browser = await chromium.launch();
    const results = [];

    for (const vp of VIEWPORTS) {
        const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
        const page = await context.newPage();
        await page.goto('http://localhost:5199', { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(2000); // Wait for GSAP animations

        // Full page screenshot
        await page.screenshot({ path: `qa-screenshots/${vp.name}-full.png`, fullPage: true });

        // Check hero name
        const nameEl = await page.$('.hero__name');
        if (nameEl) {
            const box = await nameEl.boundingBox();
            const text = await nameEl.textContent();

            // Check if name fits on one line by measuring height
            // A single line at the hero font size should be less than ~120px at most viewports
            const fontSize = await nameEl.evaluate(el => parseFloat(getComputedStyle(el).fontSize));
            const lineHeight = await nameEl.evaluate(el => {
                const lh = getComputedStyle(el).lineHeight;
                return lh === 'normal' ? parseFloat(getComputedStyle(el).fontSize) * 1.2 : parseFloat(lh);
            });
            const expectedSingleLineHeight = lineHeight * 1.5; // Allow some padding
            const isMultiLine = box.height > expectedSingleLineHeight;

            await nameEl.screenshot({ path: `qa-screenshots/${vp.name}-hero-name.png` });

            results.push({
                viewport: vp.name,
                text: text.trim(),
                width: Math.round(box.width),
                height: Math.round(box.height),
                fontSize: Math.round(fontSize),
                lineHeight: Math.round(lineHeight),
                isMultiLine,
                status: isMultiLine ? 'FAIL' : 'PASS'
            });
        }

        // Screenshot each section
        for (const section of SECTIONS) {
            const sectionEl = await page.$(`#${section}`);
            if (sectionEl) {
                await sectionEl.screenshot({ path: `qa-screenshots/${vp.name}-${section}.png` });
            }
        }

        await context.close();
    }

    console.log('\n=== HERO NAME TEST RESULTS ===\n');
    console.log('Viewport          | FontSize | Height | Lines? | Status');
    console.log('------------------|----------|--------|--------|-------');
    for (const r of results) {
        const lines = r.isMultiLine ? 'MULTI' : 'SINGLE';
        console.log(`${r.viewport.padEnd(18)}| ${String(r.fontSize).padEnd(9)}| ${String(r.height).padEnd(7)}| ${lines.padEnd(7)}| ${r.status}`);
    }

    // Check font family
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto('http://localhost:5199', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1500);

    const fontFamily = await page.$eval('.hero__name', el => getComputedStyle(el).fontFamily);
    console.log(`\nHero font-family: ${fontFamily}`);

    const heroNameText = await page.$eval('.hero__name', el => el.textContent);
    console.log(`Hero name text: "${heroNameText}"`);

    // Check all sections exist
    console.log('\n=== SECTION VISIBILITY ===\n');
    for (const section of SECTIONS) {
        const exists = await page.$(`#${section}`);
        console.log(`#${section}: ${exists ? 'EXISTS' : 'MISSING'}`);
    }

    await browser.close();
    console.log('\nScreenshots saved to qa-screenshots/');
}

run().catch(console.error);
