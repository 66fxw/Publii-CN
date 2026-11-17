/**
 * Build script: generates the WordPress-style application appearance.
 *
 * The generated file is derived from publii.css so that every semantic token
 * consumed by the components is guaranteed to exist. Only the palette values
 * and the selector scope are changed to match the classic WordPress admin look.
 *
 * Usage: node build/scripts/generate-wordpress-appearance.js
 */
const fs = require('fs');
const path = require('path');

const sourcePath = path.join(__dirname, '..', '..', 'app', 'src', 'css', 'appearances', 'publii.css');
const targetPath = path.join(__dirname, '..', '..', 'app', 'src', 'css', 'appearances', 'wordpress.css');

let css = fs.readFileSync(sourcePath, 'utf8');

// WordPress classic admin palette (light) — wp-admin: #f0f0f1 canvas, #2271b1 blue.
// Index 0 maps to palette step 5, index 1 to step 10, and so on.
const lightBrand = {
    5: '#f0f6fc', 10: '#d6e4f0', 15: '#c5d9ed', 25: '#a6c5e2', 30: '#93b8db',
    40: '#6b9fd0', 50: '#428ac4', 55: '#2271b1', 60: '#1e659e', 65: '#135e96',
    70: '#0a4b78', 75: '#043959', 90: '#0a2538'
};
const lightNeutral = {
    5: '#f6f7f7', 10: '#f0f0f1', 15: '#e0e0e1', 20: '#c3c4c7', 25: '#a7aaad',
    30: '#8c8f94', 35: '#787c82', 40: '#646970', 45: '#50575e', 50: '#3c434a',
    55: '#30363d', 60: '#23282d', 65: '#1d2327', 70: '#1a1d20', 75: '#16181a', 80: '#101113'
};

// WordPress dark mode palette.
const darkBrand = {
    5: '#182433', 10: '#1c3045', 15: '#23425f', 25: '#2f5a80', 30: '#3a6d99',
    40: '#4a86b8', 50: '#5f9ecd', 55: '#78b3dc', 60: '#8ec2e6', 65: '#a3d0ed',
    70: '#b8dcf3', 75: '#cde8f8', 90: '#e6f3fb'
};
const darkNeutral = {
    5: '#1e1e1e', 10: '#252525', 15: '#2f2f2f', 20: '#3a3a3a', 25: '#414141',
    30: '#4a4a4a', 35: '#50575e', 40: '#646970', 45: '#787c82', 46: '#7e8288',
    48: '#8c8f94', 49: '#96999e', 50: '#a7aaad', 55: '#b5b8bd', 60: '#c3c4c7',
    65: '#dcdcde', 70: '#e0e0e1', 75: '#eaeaea', 80: '#f0f0f1'
};

const paletteAnchor = '/* Private primitive palettes; components consume semantic roles below. */';

/**
 * Replace the palette declarations in the block that starts at `anchorIndex`
 * and ends at the semantic-foundations marker that follows it.
 */
function swapPalette (text, anchorIndex, brandMap, neutralMap) {
    const start = anchorIndex + paletteAnchor.length;
    const end = text.indexOf('/* Semantic foundations */', start);
    let block = text.slice(start, end);

    block = block.replace(/--palette-brand-(\d+):\s*[^;]+;/g, (match, step) => {
        const value = brandMap[step];
        return value ? '--palette-brand-' + step + ': ' + value + ';' : match;
    });
    block = block.replace(/--palette-neutral-(\d+):\s*[^;]+;/g, (match, step) => {
        const value = neutralMap[step];
        return value ? '--palette-neutral-' + step + ': ' + value + ';' : match;
    });

    return text.slice(0, start) + block + text.slice(end);
}

const firstAnchor = css.indexOf(paletteAnchor);
const secondAnchor = css.indexOf(paletteAnchor, firstAnchor + paletteAnchor.length);
if (firstAnchor === -1 || secondAnchor === -1) {
    throw new Error('Expected two palette anchors in publii.css');
}

css = swapPalette(css, secondAnchor, darkBrand, darkNeutral);
css = swapPalette(css, firstAnchor, lightBrand, lightNeutral);

// Scope every selector to the new appearance. The no-appearance fallbacks must
// stay in publii.css only, otherwise the two appearances would conflict.
css = css.replace(/html\[data-theme="default"\]:not\(\[data-app-appearance\]\),\s*/g, '');
css = css.replace(/html\[data-theme="dark"\]:not\(\[data-app-appearance\]\),\s*/g, '');
css = css.replace(/data-app-appearance="publii"/g, 'data-app-appearance="wordpress"');

// WordPress blue as the default workspace accent preview swatch.
css = css.replace(
    '--workspace-accent-default-preview: #f0f6fc;\n    --workspace-accent-default-preview: oklch(63% 0.182 251);',
    '--workspace-accent-default-preview: #2271b1;'
);
css = css.replace(
    '--workspace-accent-default-preview: oklch(63% 0.182 251);',
    '--workspace-accent-default-preview: #2271b1;'
);

// WordPress admin uses squarer corners and a Chinese-friendly UI font stack.
css = css.replace(
    /(--font-family-sans:)[^;]+;/,
    '$1 -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", "Noto Sans SC", Roboto, "Helvetica Neue", Arial, sans-serif;'
);

css = css.replace(
    /(--radius-base:)\s*6px;/,
    '$1 3px;'
);

// Classic WordPress admin signature: dark slate left sidebar and admin bar in
// both light and dark schemes. Appended last so it wins over accent overrides.
const wpChromeOverride = `

/* WordPress admin chrome: dark slate sidebar + admin bar (both color schemes) */
html[data-app-appearance="wordpress"][data-color-scheme="light"],
html[data-app-appearance="wordpress"][data-color-scheme="dark"] {
    --sidebar-bg-top: #23282d;
    --sidebar-bg-bottom: #1d2327;
    --sidebar-link-color: #b5bcc2;
    --sidebar-link-color-hover: #ffffff;
    --sidebar-link-color-active: #ffffff;
    --sidebar-link-bg-hover: #32373c;
    --sidebar-link-bg-active: #2271b1;
    --sidebar-link-opacity: 1;
    --sidebar-link-icon: #9ba2a8;
    --sidebar-link-icon-hover: #ffffff;
    --sidebar-sync-btn-bg: #2271b1;
    --sidebar-sync-btn-color: #ffffff;
    --sidebar-icon: #ffffff;
    --top-app-bar: #1d2327;

    --collection-bg-hover: #f6f7f7;
    --tab-active-color: #2271b1;
    --link-primary-color: #2271b1;
    --link-primary-color-hover: #135e96;
}
`;
css = css + wpChromeOverride;

const header = `/**
 * WordPress application appearance — Publii-CN secondary development
 *
 * Classic WordPress-admin inspired look: dark slate sidebar, light gray
 * workspace canvas, WordPress blue (#2271b1) accents and Chinese-friendly
 * typography. Generated from publii.css via
 * build/scripts/generate-wordpress-appearance.js so all semantic tokens used
 * by components remain defined. Do not edit by hand.
 */

`;

fs.writeFileSync(targetPath, header + css, 'utf8');
console.log('Generated ' + targetPath + ' (' + (header + css).split('\n').length + ' lines)');
