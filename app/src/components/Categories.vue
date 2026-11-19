<template>
    <section class="content collection-page categories-list-view">
        <div class="collection-page-header">
            <p-header :title="$t('wpCategories.title')">
                <header-search
                    slot="search"
                    :placeholder="$t('wpCategories.search')"
                    onChangeEventName="categories-filter-value-changed" />

                <p-button
                    :onClick="addCategory"
                    slot="buttons"
                    intent="primary"
                    icon="plus">
                    {{ $t('wpCategories.addNew') }}
                </p-button>
            </p-header>
        </div>

        <div class="categories-intro">{{ $t('wpCategories.intro') }}</div>

        <collection :columns="4">
            <collection-header slot="header">
                <collection-cell>
                    <collection-sort-button
                        :label="$t('ui.name')"
                        :active="orderBy === 'name'"
                        :order="order"
                        :reserve-width="false"
                        @click="ordering('name')" />
                </collection-cell>
                <collection-cell>{{ $t('ui.slug') }}</collection-cell>
                <collection-cell justify-content="center" text-align="center">
                    {{ $t('ui.posts') }}
                </collection-cell>
                <collection-cell>{{ $t('wpCategories.actions') }}</collection-cell>
            </collection-header>

            <collection-row
                v-for="category in filteredCategories"
                slot="content"
                :key="'category-row-' + category.id">
                <collection-cell>
                    <strong>{{ category.name }}</strong>
                </collection-cell>
                <collection-cell>
                    <code>{{ category.slug }}</code>
                </collection-cell>
                <collection-cell justify-content="center" text-align="center">
                    {{ getPostCount(category) }}
                </collection-cell>
                <collection-cell>
                    <button type="button" class="wp-cat-action" @click="editCategory(category)">
                        {{ $t('wpCategories.rename') }}
                    </button>
                    <button type="button" class="wp-cat-action wp-cat-action--danger" @click="deleteCategory(category)">
                        {{ $t('ui.delete') }}
                    </button>
                </collection-cell>
            </collection-row>
        </collection>

        <empty-state
            v-if="!categories.length"
            :title="$t('wpCategories.emptyTitle')"
            :description="$t('wpCategories.emptyDesc')" />

        <!-- 新增 / 重命名 弹窗（内联） -->
        <overlay v-if="editorVisible" @close="editorVisible = false">
            <div class="category-editor-popup">
                <h2>{{ editingId ? $t('wpCategories.rename') : $t('wpCategories.addNew') }}</h2>
                <label>
                    {{ $t('wpCategories.nameLabel') }}
                    <input
                        type="text"
                        v-model.trim="editorName"
                        maxlength="60"
                        @keyup.enter="saveCategory"
                        ref="nameInput" />
                </label>
                <label>
                    {{ $t('ui.slug') }}
                    <input type="text" v-model.trim="editorSlug" maxlength="80" @keyup.enter="saveCategory" />
                </label>
                <div class="category-editor-actions">
                    <button type="button" class="wp-cat-btn" @click="editorVisible = false">{{ $t('ui.cancel') }}</button>
                    <button type="button" class="wp-cat-btn wp-cat-btn--primary" :disabled="!editorName || saving" @click="saveCategory">
                        {{ $t('ui.save') }}
                    </button>
                </div>
            </div>
        </overlay>
    </section>
</template>

<script>
import Utils from '../helpers/utils';

/**
 * 分类管理页 —— 基于 site.config.json 的 categories 数组（Publii-CN 新增的一等分类法）。
 */
export default {
    name: 'categories',
    data () {
        return {
            orderBy: 'name',
            order: 'ASC',
            filterValue: '',
            editorVisible: false,
            editingId: null,
            editorName: '',
            editorSlug: '',
            saving: false
        };
    },
    computed: {
        categories () {
            const config = this.$store.state.currentSite.config || {};
            return Array.isArray(config.categories) ? config.categories : [];
        },
        filteredCategories () {
            let list = this.categories.slice();

            if (this.filterValue) {
                const needle = this.filterValue.toLowerCase();
                list = list.filter(category =>
                    category.name.toLowerCase().indexOf(needle) > -1 ||
                    (category.slug || '').toLowerCase().indexOf(needle) > -1
                );
            }

            list.sort((a, b) => {
                const result = String(a[this.orderBy] || '').localeCompare(String(b[this.orderBy] || ''));
                return this.order === 'DESC' ? -result : result;
            });

            return list;
        }
    },
    mounted () {
        this.$bus.$on('categories-filter-value-changed', this.updateFilter);
        this.$nextTick(() => {
            if (this.$refs.nameInput) {
                this.$refs.nameInput.focus();
            }
        });
    },
    beforeDestroy () {
        this.$bus.$off('categories-filter-value-changed', this.updateFilter);
    },
    methods: {
        updateFilter (value) {
            this.filterValue = value || '';
        },
        ordering (field) {
            if (this.orderBy === field) {
                this.order = this.order === 'ASC' ? 'DESC' : 'ASC';
            } else {
                this.orderBy = field;
                this.order = 'ASC';
            }
        },
        getPostCount (category) {
            if (Array.isArray(category.postIDs)) {
                return category.postIDs.length;
            }
            // 兼容旧数据：扫描所有文章的 additional_data.categories
            return this.$store.state.currentSite.posts.filter(post => {
                try {
                    const extra = JSON.parse(post.additional_data || '{}');
                    return Array.isArray(extra.categories) && extra.categories.indexOf(category.id) > -1;
                } catch (e) {
                    return false;
                }
            }).length;
        },
        slugify (value) {
            return String(value).toLowerCase().trim()
                .replace(/[^\p{L}\p{N}]+/gu, '-')
                .replace(/^-+|-+$/g, '') || ('category-' + Date.now());
        },
        addCategory () {
            this.editingId = null;
            this.editorName = '';
            this.editorSlug = '';
            this.editorVisible = true;
            this.$nextTick(() => this.$refs.nameInput && this.$refs.nameInput.focus());
        },
        editCategory (category) {
            this.editingId = category.id;
            this.editorName = category.name;
            this.editorSlug = category.slug || '';
            this.editorVisible = true;
            this.$nextTick(() => this.$refs.nameInput && this.$refs.nameInput.focus());
        },
        saveCategory () {
            if (!this.editorName || this.saving) {
                return;
            }

            let categories = this.categories.slice();
            const oldSlug = this.editingId ? (categories.find(c => c.id === this.editingId) || {}).slug : null;
            const slug = this.editorSlug || this.slugify(this.editorName);

            if (this.editingId) {
                categories = categories.map(category =>
                    category.id === this.editingId
                        ? { ...category, name: this.editorName, slug: slug }
                        : category
                );
            } else {
                categories.push({
                    id: 'cat-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
                    name: this.editorName,
                    slug: slug,
                    postIDs: []
                });
            }

            // 若修改 slug，需要同步更新所有文章 additional_data.categories 中的引用
            // （本实现使用 id 关联，slug 变化不影响文章关联，无需迁移）
            void oldSlug;

            this.editorVisible = false;
            this.persist(categories, this.editingId ? 'wpCategories.updated' : 'wpCategories.added');
        },
        deleteCategory (category) {
            this.$bus.$emit('confirm-display', {
                hasInput: false,
                message: this.$t('wpCategories.deleteConfirm', { name: category.name }),
                okLabel: this.$t('ui.delete'),
                cancelLabel: this.$t('ui.cancel'),
                isDanger: true,
                okClick: () => {
                    const categories = this.categories.filter(item => item.id !== category.id);
                    this.persist(categories, 'wpCategories.deleted');
                }
            });
        },
        persist (categories, messageKey) {
            if (this.saving) {
                return;
            }

            this.saving = true;
            const siteName = this.$store.state.currentSite.config.name;
            const newSettings = Utils.deepMerge(
                JSON.parse(JSON.stringify(this.$store.state.currentSite.config)),
                { categories: categories }
            );

            mainProcessAPI.send('app-site-config-save', {
                site: siteName,
                settings: newSettings,
                source: 'categories'
            });

            mainProcessAPI.receiveOnce('app-site-config-saved', data => {
                this.saving = false;

                if (data.status === true) {
                    // 传入 oldName：replaceSiteConfig 需要它更新 sites map；
                    // 缺失会导致 state.sites[undefined] 解析异常，界面不刷新。
                    this.$store.commit('replaceSiteConfig', {
                        newSettings: newSettings,
                        oldName: siteName
                    });
                    this.$bus.$emit('message-display', {
                        message: this.$t(messageKey),
                        type: 'success',
                        lifeTime: 3
                    });
                    // 通知编辑器等其它视图刷新分类列表
                    this.$bus.$emit('categories-updated');
                } else {
                    this.$bus.$emit('message-display', {
                        message: this.$t('wpCategories.saveError'),
                        type: 'warning',
                        lifeTime: 4
                    });
                }
            });
        }
    }
};
</script>

<style scoped>
/* 关键：引入 collection-page 的 flex 布局，否则 .collection 高度塌陷，分类行被裁切不显示 */
@import "../css/collection-page.css";
@import "../css/collection-sorting.css";

.categories-intro {
    color: var(--text-light-color, #646970);
    font-size: 1.3rem;
    margin: 0 0 1.6rem;
}

.wp-cat-action {
    background: transparent;
    border: 0;
    color: var(--link-primary-color, #2271b1);
    cursor: pointer;
    font-size: 1.25rem;
    padding: .2rem .6rem;
}

.wp-cat-action--danger {
    color: var(--color-danger, #d63638);
}

.category-editor-popup {
    background: var(--bg-primary, #fff);
    border-radius: 6px;
    box-shadow: 0 5px 25px rgba(0, 0, 0, .3);
    min-width: 36rem;
    padding: 2.4rem;
}

.category-editor-popup h2 {
    font-size: 1.8rem;
    margin: 0 0 1.8rem;
}

.category-editor-popup label {
    display: block;
    font-size: 1.3rem;
    margin-bottom: 1.4rem;
}

.category-editor-popup input {
    background: var(--input-bg, #fff);
    border: 1px solid var(--input-border-color, #c3c4c7);
    border-radius: 4px;
    color: var(--text-primary-color, #23282d);
    display: block;
    font-size: 1.4rem;
    margin-top: .5rem;
    padding: .7rem .9rem;
    width: 100%;
}

.category-editor-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
}

.wp-cat-btn {
    background: var(--palette-neutral-10, #f0f0f1);
    border: 1px solid var(--input-border-color, #c3c4c7);
    border-radius: 4px;
    cursor: pointer;
    font-size: 1.3rem;
    padding: .6rem 1.4rem;
}

.wp-cat-btn--primary {
    background: var(--palette-brand-55, #2271b1);
    border-color: var(--palette-brand-55, #2271b1);
    color: #fff;
}

.wp-cat-btn:disabled {
    cursor: default;
    opacity: .5;
}
</style>
