/**
 * Locale-aware string comparison for the currently selected UI language.
 *
 * JavaScript's String.prototype.localeCompare() relies on the runtime/system
 * locale when no locale is provided. That makes Chinese sorting unpredictable
 * (often raw Unicode code-point order instead of pinyin order) and dependent
 * on the user's operating system. Passing an explicit BCP-47 locale gives
 * deterministic, natural ordering for every supported language.
 */

// Map Publii language codes to BCP-47 locales used by localeCompare.
const LOCALE_MAP = {
    'zh-cn': 'zh-Hans-CN',
    'zh-tw': 'zh-Hant-TW',
    'de': 'de-DE',
    'pl': 'pl-PL',
    'en-gb': 'en-GB'
};

/**
 * Resolve the BCP-47 locale for a Publii language code.
 *
 * @param {string} language - Publii language code (e.g. 'zh-cn')
 * @returns {string} BCP-47 locale tag
 */
export function resolveLocale (language) {
    if (!language) {
        return undefined; // fall back to runtime default
    }

    const normalized = String(language).toLowerCase().replace('_', '-');

    if (LOCALE_MAP[normalized]) {
        return LOCALE_MAP[normalized];
    }

    // Pass through already well-formed codes (e.g. 'fr-FR', 'pt-BR').
    return language;
}

/**
 * Build a comparison function bound to the UI language.
 *
 * @param {string} language - Publii language code from state.app.config.language
 * @returns {Function} (a, b) => number, suitable for Array.prototype.sort
 */
export function localeCompare (language) {
    const locale = resolveLocale(language);

    return (a, b) => String(a).localeCompare(String(b), locale, { numeric: true, sensitivity: 'base' });
}

export default localeCompare;
