<template>
    <aside
        class="wp-right-panel"
        :class="{ 'is-open': isOpen }"
        aria-label="右侧设置面板">

        <!-- Collapsed handle -->
        <button
            type="button"
            class="wp-right-panel__handle"
            :title="isOpen ? $t('wpPanel.collapse') : $t('wpPanel.expand')"
            @click="toggle">
            <span class="wp-right-panel__handle-icon">{{ isOpen ? '›' : '‹' }}</span>
            <span class="wp-right-panel__handle-text">{{ $t('wpPanel.title') }}</span>
        </button>

        <div class="wp-right-panel__body" v-if="isOpen">
            <header class="wp-right-panel__header">
                <h2>{{ $t('wpPanel.title') }}</h2>
                <button
                    type="button"
                    class="wp-right-panel__close"
                    :title="$t('wpPanel.collapse')"
                    @click="toggle">×</button>
            </header>

            <nav class="wp-right-panel__tabs" role="tablist">
                <button
                    v-for="tab in tabs"
                    :key="tab.id"
                    type="button"
                    role="tab"
                    :aria-selected="activeTab === tab.id"
                    :class="['wp-right-panel__tab', { 'is-active': activeTab === tab.id }]"
                    @click="activeTab = tab.id">
                    {{ tab.label }}
                </button>
            </nav>

            <div class="wp-right-panel__content">
                <!-- 分类 / Categories -->
                <section v-if="activeTab === 'categories'" class="wp-section">
                    <p class="wp-section__hint">{{ $t('wpPanel.categoriesHint') }}</p>
                    <form class="wp-inline-form" @submit.prevent="addCategory">
                        <input
                            type="text"
                            v-model.trim="newCategoryName"
                            :placeholder="$t('wpPanel.categoryNamePlaceholder')"
                            maxlength="60" />
                        <button type="submit" class="wp-btn wp-btn--primary" :disabled="!newCategoryName">
                            {{ $t('wpPanel.add') }}
                        </button>
                    </form>
                    <ul class="wp-list">
                        <li v-for="category in categories" :key="category.id" class="wp-list__item">
                            <template v-if="editingCategoryId === category.id">
                                <input
                                    type="text"
                                    v-model.trim="editingCategoryName"
                                    @keyup.enter="saveCategory"
                                    @keyup.esc="editingCategoryId = null"
                                    maxlength="60" />
                                <button type="button" class="wp-btn wp-btn--small" @click="saveCategory">{{ $t('wpPanel.save') }}</button>
                                <button type="button" class="wp-btn wp-btn--small" @click="editingCategoryId = null">{{ $t('ui.cancel') }}</button>
                            </template>
                            <template v-else>
                                <span class="wp-list__label" :title="category.slug">{{ category.name }}</span>
                                <span class="wp-list__count">{{ category.postIDs ? category.postIDs.length : 0 }}</span>
                                <button type="button" class="wp-icon-btn" :title="$t('wpPanel.rename')" @click="startEditCategory(category)">✎</button>
                                <button type="button" class="wp-icon-btn wp-icon-btn--danger" :title="$t('wpPanel.delete')" @click="removeCategory(category)">×</button>
                            </template>
                        </li>
                        <li v-if="!categories.length" class="wp-list__empty">{{ $t('wpPanel.noCategories') }}</li>
                    </ul>
                </section>

                <!-- 页面 / Pages -->
                <section v-if="activeTab === 'pages'" class="wp-section">
                    <div class="wp-section__actions">
                        <span>{{ $t('wpPanel.pagesCount', { count: pages.length }) }}</span>
                        <button type="button" class="wp-btn wp-btn--small wp-btn--primary" @click="goTo('pages')">
                            {{ $t('wpPanel.manageAll') }}
                        </button>
                    </div>
                    <ul class="wp-list">
                        <li v-for="page in limitedPages" :key="page.id" class="wp-list__item">
                            <a href="#" class="wp-list__label" @click.prevent="goTo('pages')">{{ page.title }}</a>
                            <span class="wp-list__badge" v-if="page.isDraft">{{ $t('wpPanel.draft') }}</span>
                        </li>
                        <li v-if="!pages.length" class="wp-list__empty">{{ $t('wpPanel.noPages') }}</li>
                    </ul>
                    <button v-if="pages.length > listLimit" type="button" class="wp-link" @click="goTo('pages')">
                        {{ $t('wpPanel.manageAll') }} →
                    </button>
                </section>

                <!-- 标签 / Tags -->
                <section v-if="activeTab === 'tags'" class="wp-section">
                    <div class="wp-section__actions">
                        <span>{{ $t('wpPanel.tagsCount', { count: tags.length }) }}</span>
                        <button type="button" class="wp-btn wp-btn--small wp-btn--primary" @click="goTo('tags')">
                            {{ $t('wpPanel.manageAll') }}
                        </button>
                    </div>
                    <div class="wp-tag-cloud">
                        <button
                            v-for="tag in tags"
                            :key="tag.id"
                            type="button"
                            class="wp-tag"
                            :title="tag.postsCounter + ' ' + $t('wpPanel.posts')"
                            @click="goTo('tags')">
                            {{ tag.name }} <span class="wp-tag__count">{{ tag.postsCounter }}</span>
                        </button>
                        <span v-if="!tags.length" class="wp-list__empty">{{ $t('wpPanel.noTags') }}</span>
                    </div>
                </section>

                <!-- 菜单 / Menus -->
                <section v-if="activeTab === 'menus'" class="wp-section">
                    <p class="wp-section__hint">{{ $t('wpPanel.menusHint') }}</p>
                    <ul class="wp-list">
                        <li v-for="(menu, index) in menus" :key="index" class="wp-list__item wp-list__item--stack">
                            <div class="wp-list__row">
                                <span class="wp-list__label">{{ menu.name || (menu.key || ('#' + (index + 1))) }}</span>
                                <span class="wp-list__count">{{ menu.items ? menu.items.length : 0 }}</span>
                            </div>
                        </li>
                        <li v-if="!menus.length" class="wp-list__empty">{{ $t('wpPanel.noMenus') }}</li>
                    </ul>
                    <button type="button" class="wp-btn wp-btn--primary wp-btn--block" @click="goTo('menus')">
                        {{ $t('wpPanel.manageMenus') }} →
                    </button>
                </section>
            </div>
        </div>
    </aside>
</template>

<script>
import Utils from '../helpers/utils';

const STORAGE_KEY = 'publii-cn-right-panel-open';
const STORAGE_TAB_KEY = 'publii-cn-right-panel-tab';
const LIST_LIMIT = 20;

/**
 * Right-side quick settings dock inspired by the WordPress admin meta boxes.
 * Pages / Tags / Menus read the existing Vuex store; Categories are a new
 * lightweight taxonomy persisted in the site config (no DB migration needed).
 */
export default {
    name: 'wp-right-panel',
    data () {
        return {
            isOpen: false,
            activeTab: 'categories',
            newCategoryName: '',
            editingCategoryId: null,
            editingCategoryName: '',
            listLimit: LIST_LIMIT,
            saving: false
        };
    },
    computed: {
        tabs () {
            return [
                { id: 'categories', label: this.$t('wpPanel.categories') },
                { id: 'pages', label: this.$t('wpPanel.pages') },
                { id: 'tags', label: this.$t('wpPanel.tags') },
                { id: 'menus', label: this.$t('wpPanel.menus') }
            ];
        },
        siteName () {
            return this.$route.params.name;
        },
        categories () {
            const config = this.$store.state.currentSite.config || {};
            return Array.isArray(config.categories) ? config.categories : [];
        },
        pages () {
            if (!this.$store.getters.sitePages) {
                return [];
            }
            return this.$store.getters.sitePages('', '', 'ASC') || [];
        },
        limitedPages () {
            return this.pages.slice(0, this.listLimit);
        },
        tags () {
            if (!this.$store.getters.siteTags) {
                return [];
            }
            return this.$store.getters.siteTags('', 'name', 'ASC') || [];
        },
        menus () {
            const menus = this.$store.state.currentSite.menuStructure || [];
            if (Array.isArray(menus)) {
                return menus.map((menu, index) => ({
                    key: menu.key || menu.name || ('menu-' + index),
                    name: menu.name || menu.key || '',
                    items: Array.isArray(menu.items) ? menu.items : []
                }));
            }
            return [];
        }
    },
    mounted () {
        this.isOpen = window.localStorage.getItem(STORAGE_KEY) === 'true';
        const savedTab = window.localStorage.getItem(STORAGE_TAB_KEY);
        if (['categories', 'pages', 'tags', 'menus'].indexOf(savedTab) !== -1) {
            this.activeTab = savedTab;
        }
    },
    watch: {
        isOpen (value) {
            window.localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
            this.$nextTick(() => {
                this.$bus.$emit('right-panel-toggled', value);
            });
        },
        activeTab (value) {
            window.localStorage.setItem(STORAGE_TAB_KEY, value);
        }
    },
    methods: {
        toggle () {
            this.isOpen = !this.isOpen;
        },
        // Navigate to the section's list view. The real "Add/Edit" controls live
        // inside those views (they use internal editor state, not standalone
        // routes), so deep-linking directly to an editor is not supported.
        goTo (section) {
            this.$router.push('/site/' + this.siteName + '/' + section + '/');
        },
        slugify (value) {
            return String(value)
                .toLowerCase()
                .trim()
                .replace(/[^\p{L}\p{N}]+/gu, '-')
                .replace(/^-+|-+$/g, '') || ('category-' + Date.now());
        },
        persistCategories (categories, successMessageKey) {
            if (this.saving) {
                return;
            }

            this.saving = true;
            const siteName = this.siteName;
            const currentSiteConfig = this.$store.state.currentSite.config;
            const newSettings = Utils.deepMerge(
                JSON.parse(JSON.stringify(currentSiteConfig)),
                { categories: categories }
            );

            mainProcessAPI.send('app-site-config-save', {
                site: siteName,
                settings: newSettings,
                source: 'categories'
            });

            mainProcessAPI.receiveOnce('app-site-config-saved', (data) => {
                this.saving = false;

                if (data.status === true) {
                    this.$store.commit('replaceSiteConfig', {
                        newSettings: newSettings,
                        oldName: siteName
                    });
                    this.$bus.$emit('categories-updated');
                    this.$bus.$emit('message-display', {
                        message: this.$t(successMessageKey),
                        type: 'success',
                        lifeTime: 3
                    });
                } else {
                    this.$bus.$emit('message-display', {
                        message: this.$t('wpPanel.saveError'),
                        type: 'warning',
                        lifeTime: 4
                    });
                }
            });
        },
        addCategory () {
            if (!this.newCategoryName || this.saving) {
                return;
            }

            const categories = this.categories.slice();
            const id = 'cat-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
            categories.push({
                id: id,
                name: this.newCategoryName,
                slug: this.slugify(this.newCategoryName),
                postIDs: []
            });

            this.newCategoryName = '';
            this.persistCategories(categories, 'wpPanel.categoryAdded');
        },
        startEditCategory (category) {
            this.editingCategoryId = category.id;
            this.editingCategoryName = category.name;
        },
        saveCategory () {
            if (!this.editingCategoryName || this.saving) {
                return;
            }

            const categories = this.categories.map((category) => {
                if (category.id === this.editingCategoryId) {
                    return {
                        ...category,
                        name: this.editingCategoryName,
                        slug: this.slugify(this.editingCategoryName)
                    };
                }
                return category;
            });

            this.editingCategoryId = null;
            this.editingCategoryName = '';
            this.persistCategories(categories, 'wpPanel.categoryUpdated');
        },
        removeCategory (category) {
            if (this.saving) {
                return;
            }

            this.$bus.$emit('confirm-display', {
                hasInput: false,
                message: this.$t('wpPanel.deleteCategoryConfirm', { name: category.name }),
                okLabel: this.$t('ui.delete'),
                cancelLabel: this.$t('ui.cancel'),
                isDanger: true,
                okClick: () => {
                    const categories = this.categories.filter((item) => item.id !== category.id);
                    this.persistCategories(categories, 'wpPanel.categoryDeleted');
                }
            });
        }
    },
    beforeDestroy () {
        // Nothing to unsubscribe; bus listeners are owned by other components.
    }
};
</script>

<style scoped>
.wp-right-panel {
    background: var(--bg-primary, #fff);
    border-left: 1px solid var(--border-light-color, #c3c4c7);
    bottom: 0;
    display: flex;
    position: absolute;
    right: 0;
    top: 0;
    transition: width .2s ease-out;
    width: 0;
    z-index: 5;
}

.wp-right-panel.is-open {
    width: 30rem;
}

.wp-right-panel__handle {
    align-items: center;
    background: var(--palette-brand-55, #2271b1);
    border: 0;
    border-radius: 6px 0 0 6px;
    color: #fff;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: .6rem;
    height: 11rem;
    left: -2.8rem;
    justify-content: center;
    padding: 0;
    position: absolute;
    top: 1.6rem;
    width: 2.8rem;
}

.wp-right-panel__handle-icon {
    font-size: 2rem;
    line-height: 1;
}

.wp-right-panel__handle-text {
    font-size: 1.2rem;
    line-height: 1.3;
    writing-mode: vertical-rl;
}

.wp-right-panel__body {
    display: flex;
    flex-direction: column;
    min-width: 29rem;
    overflow: hidden;
    width: 100%;
}

.wp-right-panel__header {
    align-items: center;
    border-bottom: 1px solid var(--border-light-color, #c3c4c7);
    display: flex;
    flex-shrink: 0;
    justify-content: space-between;
    padding: 1.2rem 1.6rem;
}

.wp-right-panel__header h2 {
    font-size: 1.6rem;
    font-weight: 600;
    margin: 0;
}

.wp-right-panel__close {
    background: transparent;
    border: 0;
    color: var(--text-light-color, #646970);
    cursor: pointer;
    font-size: 2.2rem;
    line-height: 1;
    padding: 0 .4rem;
}

.wp-right-panel__tabs {
    border-bottom: 1px solid var(--border-light-color, #c3c4c7);
    display: flex;
    flex-shrink: 0;
}

.wp-right-panel__tab {
    background: transparent;
    border: 0;
    border-bottom: 2px solid transparent;
    color: var(--text-light-color, #646970);
    cursor: pointer;
    flex: 1;
    font-size: 1.3rem;
    padding: 1.1rem 0;
    white-space: nowrap;
}

.wp-right-panel__tab:hover {
    color: var(--link-primary-color, #2271b1);
}

.wp-right-panel__tab.is-active {
    border-bottom-color: var(--link-primary-color, #2271b1);
    color: var(--link-primary-color, #2271b1);
    font-weight: 600;
}

.wp-right-panel__content {
    flex: 1;
    overflow-y: auto;
    padding: 1.6rem;
}

.wp-section__hint,
.wp-section__actions {
    color: var(--text-light-color, #646970);
    font-size: 1.25rem;
    line-height: 1.6;
    margin: 0 0 1.2rem;
}

.wp-section__actions {
    align-items: center;
    display: flex;
    justify-content: space-between;
}

.wp-inline-form {
    display: flex;
    gap: .6rem;
    margin-bottom: 1.4rem;
}

.wp-inline-form input,
.wp-list input {
    background: var(--input-bg, #fff);
    border: 1px solid var(--input-border-color, #c3c4c7);
    border-radius: 4px;
    color: var(--text-primary-color, #23282d);
    flex: 1;
    font-size: 1.3rem;
    min-width: 0;
    padding: .6rem .8rem;
}

.wp-list {
    list-style: none;
    margin: 0;
    padding: 0;
}

.wp-list__item {
    align-items: center;
    border-bottom: 1px solid var(--border-light-color, #e0e0e1);
    display: flex;
    gap: .6rem;
    min-height: 3.4rem;
    padding: .6rem 0;
}

.wp-list__item--stack {
    display: block;
}

.wp-list__row {
    align-items: center;
    display: flex;
    justify-content: space-between;
}

.wp-list__label {
    color: var(--text-primary-color, #23282d);
    flex: 1;
    font-size: 1.3rem;
    overflow: hidden;
    text-decoration: none;
    text-overflow: ellipsis;
    white-space: nowrap;
}

a.wp-list__label:hover {
    color: var(--link-primary-color, #2271b1);
}

.wp-list__count,
.wp-tag__count {
    background: var(--palette-neutral-10, #f0f0f1);
    border-radius: 10px;
    color: var(--text-light-color, #646970);
    font-size: 1.1rem;
    padding: .1rem .7rem;
}

.wp-list__badge {
    background: var(--color-warning, #dba617);
    border-radius: 3px;
    color: #fff;
    font-size: 1rem;
    padding: .1rem .5rem;
}

.wp-list__empty {
    color: var(--text-light-color, #646970);
    font-size: 1.3rem;
    padding: 1.4rem 0;
    text-align: center;
}

.wp-tag-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: .6rem;
}

.wp-tag {
    background: var(--palette-brand-5, #f0f6fc);
    border: 1px solid var(--palette-brand-10, #d6e4f0);
    border-radius: 3px;
    color: var(--link-primary-color, #2271b1);
    cursor: pointer;
    font-size: 1.25rem;
    padding: .4rem .8rem;
}

.wp-tag:hover {
    border-color: var(--link-primary-color, #2271b1);
}

.wp-btn {
    background: var(--palette-neutral-10, #f0f0f1);
    border: 1px solid var(--input-border-color, #c3c4c7);
    border-radius: 4px;
    color: var(--text-primary-color, #23282d);
    cursor: pointer;
    font-size: 1.25rem;
    padding: .55rem 1rem;
}

.wp-btn:hover:not(:disabled) {
    border-color: var(--link-primary-color, #2271b1);
}

.wp-btn:disabled {
    cursor: default;
    opacity: .5;
}

.wp-btn--primary {
    background: var(--palette-brand-55, #2271b1);
    border-color: var(--palette-brand-55, #2271b1);
    color: #fff;
}

.wp-btn--primary:hover:not(:disabled) {
    background: var(--palette-brand-60, #1e659e);
}

.wp-btn--small {
    font-size: 1.15rem;
    padding: .35rem .7rem;
}

.wp-btn--block {
    display: block;
    margin-top: 1.4rem;
    text-align: center;
    width: 100%;
}

.wp-icon-btn {
    background: transparent;
    border: 0;
    color: var(--text-light-color, #646970);
    cursor: pointer;
    font-size: 1.6rem;
    padding: 0 .3rem;
}

.wp-icon-btn:hover {
    color: var(--link-primary-color, #2271b1);
}

.wp-icon-btn--danger:hover {
    color: var(--color-danger, #d63638);
}

.wp-link {
    background: transparent;
    border: 0;
    color: var(--link-primary-color, #2271b1);
    cursor: pointer;
    display: inline-block;
    font-size: 1.25rem;
    margin-top: 1rem;
    padding: 0;
}
</style>
