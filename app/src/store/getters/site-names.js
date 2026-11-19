/**
 * Returns array with website names
 *
 * @param state
 * @param getters
 *
 * @returns {array}
 */

import { localeCompare } from '../../helpers/locale-compare.js';

export default (state, getters) => {
    const compare = localeCompare(state.app && state.app.config ? state.app.config.language : '');
    let siteNames = Object.keys(state.sites);
    siteNames.sort((a, b) => compare(a, b));
    return siteNames;
};
