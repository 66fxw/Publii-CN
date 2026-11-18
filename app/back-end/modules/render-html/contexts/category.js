// Necessary packages
const RendererContext = require('../renderer-context.js');
const RendererHelpers = require('./../helpers/helpers.js');

/**
 * Publii-CN: Class used to create context for a single CATEGORY archive page.
 * Categories are stored in site config (not a DB table), so posts are filtered
 * from the cached post items by their `categories` object array.
 */
class RendererContextCategory extends RendererContext {
    loadData() {
        this.postsNumber = parseInt(this.postsNumber, 10);
        this.offset = parseInt(this.offset, 10);

        // Find the category object by its string ID
        this.category = (this.siteConfig.categories || []).find(category => category.id === this.categoryID) || {
            id: this.categoryID,
            name: '',
            slug: '',
            postIDs: []
        };

        if (this.postsNumber === -1) {
            this.postsNumber = 999;
        }

        if (this.postsNumber === 0) {
            this.posts = [];
            return;
        }

        // Gather all published, visible posts that belong to this category
        let allPosts = Object.keys(this.renderer.cachedItems.posts)
            .map(id => this.renderer.cachedItems.posts[id])
            .filter(post => {
                let status = post.status || '';
                if (status.indexOf('published') === -1) return false;
                if (status.indexOf('hidden') > -1) return false;
                if (status.indexOf('trashed') > -1) return false;
                if (status.indexOf('is-page') > -1) return false;

                let postCategories = post.categories || [];
                return postCategories.some(category => category.id === this.categoryID);
            });

        allPosts.sort((a, b) => {
            let field = 'created_at';
            let order = this.postsOrdering || 'created_at DESC';
            let parts = order.split(' ');
            field = parts[0] || 'created_at';
            let descending = (parts[1] || 'DESC').toUpperCase() === 'DESC';
            let result = String(a[field]).localeCompare(String(b[field]));
            return descending ? -result : result;
        });

        this.posts = allPosts.slice(this.offset, this.offset + this.postsNumber);

        this.menus = this.renderer.commonData.menus;
        this.unassignedMenus = this.renderer.commonData.unassignedMenus;
        this.authors = this.renderer.commonData.authors;
        this.categories = this.siteConfig.categories || [];
        this.tags = this.renderer.commonData.tags.filter(tag => tag.additionalData.isHidden !== true);
        this.hiddenPosts = this.renderer.commonData.hiddenPosts;
        this.pages = this.renderer.commonData.pages;
        this.featuredPosts = [];
    }

    prepareData() {
        let siteName = this.siteConfig.name;

        if (this.siteConfig.displayName) {
            siteName = this.siteConfig.displayName;
        }

        let metaTitleTemplate = this.siteConfig.advanced.categoryMetaTitle || 'Category: %categoryname - %sitename';
        let metaDescTemplate = this.siteConfig.advanced.categoryMetaDescription || '';

        this.title = metaTitleTemplate.replace(/%categoryname/g, this.category.name).replace(/%sitename/g, siteName);

        this.posts = this.posts || [];
        this.hiddenPosts = this.hiddenPosts || [];
        this.hiddenPosts = this.hiddenPosts.map(post => this.renderer.cachedItems.posts[post.id]);
        this.pages = this.pages || [];
        this.pages = this.pages.map(page => this.renderer.cachedItems.pages[page.id]);

        this.metaTitle = metaTitleTemplate.replace(/%categoryname/g, this.category.name).replace(/%sitename/g, siteName);
        this.metaDescription = metaDescTemplate.replace(/%categoryname/g, this.category.name).replace(/%sitename/g, siteName);
        this.metaRobots = false;
        this.hasCustomCanonicalUrl = false;
        this.canonicalUrl = '';

        if (this.metaTitle === '') {
            this.metaTitle = this.siteConfig.advanced.metaTitle.replace(/%sitename/g, siteName);
        }

        if (this.metaDescription === '') {
            this.metaDescription = this.siteConfig.advanced.metaDescription.replace(/%sitename/g, siteName);
        }
    }

    setContext() {
        this.loadData();
        this.prepareData();

        let metaRobotsValue = this.siteConfig.advanced.metaRobotsCategories || 'noindex, follow';

        if (this.metaRobots !== false) {
            metaRobotsValue = this.metaRobots;
        }

        if (this.siteConfig.advanced.noIndexThisPage) {
            metaRobotsValue = 'noindex,nofollow';
        }

        this.context = {
            title: this.metaTitle !== '' ? this.metaTitle : this.title,
            category: this.category,
            posts: this.posts,
            pages: this.pages,
            featuredPosts: this.featuredPosts,
            hiddenPosts: this.hiddenPosts,
            categories: this.categories,
            tags: this.tags,
            authors: this.authors,
            metaTitleRaw: this.metaTitle,
            metaDescriptionRaw: this.metaDescription,
            metaRobotsRaw: metaRobotsValue,
            hasCustomCanonicalUrl: this.hasCustomCanonicalUrl,
            canonicalUrl: this.canonicalUrl,
            siteOwner: this.renderer.cachedItems.authors[1],
            menus: this.menus,
            unassignedMenus: this.unassignedMenus
        };
    }

    getContext(categoryID, offset = 0, postsNumber = 999) {
        this.offset = offset;
        this.postsNumber = postsNumber;
        this.categoryID = categoryID;
        this.setContext();

        return this.context;
    }
}

module.exports = RendererContextCategory;
