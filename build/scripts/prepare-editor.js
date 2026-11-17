'use strict';

/*
 * Prepares app/dist for the editor loaded by app/dist/index.html:
 *   - builds the standalone editor stylesheets (app/dist/css),
 *   - recreates app/dist/vendor with HugeRTE and jQuery copied from
 *     app/src/helpers/vendor.
 *
 * Cross-platform replacement for the former shell/cmd script chains behind
 * `npm run prepare-editor` and `npm run prepare-editor:win`.
 */

const fs = require('node:fs');
const path = require('node:path');
const prepareEditorCss = require('./prepare-editor-css.js');

const appDir = path.join(__dirname, '..', '..', 'app');
const vendorSrcDir = path.join(appDir, 'src', 'helpers', 'vendor');
const vendorDistDir = path.join(appDir, 'dist', 'vendor');
const vendorPackages = ['hugerte', 'jquery'];

prepareEditorCss();

fs.rmSync(vendorDistDir, { recursive: true, force: true });
fs.mkdirSync(vendorDistDir, { recursive: true });

for (const name of vendorPackages) {
    const src = path.join(vendorSrcDir, name);
    const dest = path.join(vendorDistDir, name);
    // Use an explicit recursive copy: fs.cpSync can abort the process on some
    // Windows filesystems with deeply nested trees (observed exit 127). These
    // dependencies contain no symlinks, so a plain recursive copy is sufficient.
    copyDirRecursive(src, dest);
    console.log('Copied: app/dist/vendor/' + name);
}

function copyDirRecursive (src, dest) {
    fs.mkdirSync(dest, { recursive: true });

    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const from = path.join(src, entry.name);
        const to = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirRecursive(from, to);
        } else {
            fs.copyFileSync(from, to);
        }
    }
}
