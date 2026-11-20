const assert = require('node:assert/strict');
const path = require('node:path');

// Regression test: themes whose config "name" differs from their folder name
// (e.g. "China News" in "china-news") must still resolve asset paths for MD5
// version suffixes. The helpers must use renderer.themeName, not name.toLowerCase().
function loadHelperWithSpiedPaths (helperFile, subDir, fileName) {
    const Module = require('node:module');
    const fs = require('node:fs');
    const src = fs.readFileSync(helperFile, 'utf8');
    const captured = [];

    // Evaluate the helper source with a stubbed `path.join` that records the
    // theme directory segment, so we can assert which name was used.
    const realJoin = path.join;
    const stubPath = Object.create(path);
    stubPath.join = function (...parts) {
        captured.push(parts);
        return realJoin(...parts);
    };

    const mockedRequire = name => {
        if (name === 'path') return stubPath;
        if (name === 'fs') return { existsSync: () => false };
        if (name === 'fast-memoize') return fn => fn;
        if (name === 'crypto') return require('node:crypto');
        if (name.includes('file.js')) return { readFileSync: () => 'stub' };
        return require(name);
    };

    const factory = new Function('require', 'module', src + '\n;return module.exports;');
    const helperFactory = factory(mockedRequire, { exports: {} });

    const helpers = {};
    const Handlebars = {
        registerHelper: (name, fn) => { helpers[name] = fn; },
        SafeString: class { constructor (v) { this.value = v; } },
        Utils: { escapeExpression: v => v }
    };

    const rendererInstance = {
        inputDir: '/sites/demo/input',
        themeName: 'china-news',
        themeConfig: {
            name: 'China News',
            files: { assetsPath: 'assets' }
        },
        siteConfig: {
            domain: 'https://demo.github.io',
            advanced: { versionSuffix: true }
        }
    };

    helperFactory(rendererInstance, Handlebars);
    helpers[helperFile.includes('css') ? 'css' : 'js'](fileName);

    return captured.find(parts => parts.indexOf('themes') > -1);
}

describe('CSS/JS helpers resolve assets via the real theme directory name', function () {
    const base = __dirname + '/..';

    it('css helper uses themeName (china-news), not name.toLowerCase() (china news)', function () {
        const parts = loadHelperWithSpiedPaths(base + '/css.js', 'css', 'style.css');
        assert.ok(parts, 'path.join with themes segment should be called');
        const idx = parts.indexOf('themes');
        assert.strictEqual(parts[idx + 1], 'china-news');
        assert.notStrictEqual(parts[idx + 1], 'china news');
    });

    it('js helper uses themeName (china-news), not name.toLowerCase() (china news)', function () {
        const parts = loadHelperWithSpiedPaths(base + '/js.js', 'js', 'scripts.js');
        assert.ok(parts, 'path.join with themes segment should be called');
        const idx = parts.indexOf('themes');
        assert.strictEqual(parts[idx + 1], 'china-news');
        assert.notStrictEqual(parts[idx + 1], 'china news');
    });
});
