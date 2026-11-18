// Necessary packages
const RendererContext = require('../renderer-context.js');

/**
 * Publii-CN: Class used to create context for the CATEGORIES list view.
 */
class RendererContextCategories extends RendererContext {
    loadData() {
        this.categories = (this.siteConfig.categories || []).slice();
        this.menus = this.renderer.commonData.menus;
        this.unassignedMenus = this.renderer.commonData.unassignedMenus;
        this.authors = this.renderer.commonData.authors;
        this.hiddenPosts = this.renderer.commonData.hiddenPosts;
        this.pages = this.renderer.commonData.pages;
    }

    prepareData() {
        let siteName = this.siteConfig.name;

        if (this.siteConfig.displayName) {
            siteName = this.siteConfig.displayName;
        }

        let metaTitleTemplate = this.siteConfig.advanced.categoriesMetaTitle || 'All categories - %sitename';
        let metaDescTemplate = this.siteConfig.advanced.categoriesMetaDescription || '';

        this.title = metaTitleTemplate.replace(/%sitename/g, siteName);
        this.hiddenPosts = this.hiddenPosts || [];
        this.hiddenPosts = this.hiddenPosts.map(post => this.renderer.cachedItems.posts[post.id]);
        this.pages = this.pages || [];
        this.pages = this.pages.map(page => this.renderer.cachedItems.pages[page.id]);

        this.metaTitle = metaTitleTemplate.replace(/%sitename/g, siteName);
        this.metaDescription = metaDescTemplate.replace(/%sitename/g, siteName);

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

        let metaRobotsValue = this.siteConfig.advanced.metaRobotsCategoriesList || 'noindex, follow';

        if (this.siteConfig.advanced.noIndexThisPage) {
            metaRobotsValue = 'noindex,nofollow';
        }

        this.context = {
            title: this.metaTitle !== '' ? this.metaTitle : this.title,
            hiddenPosts: this.hiddenPosts,
            pages: this.pages,
            categories: this.categories,
            categoriesNumber: this.categories.length,
            authors: this.authors,
            metaTitleRaw: this.metaTitle,
            metaDescriptionRaw: this.metaDescription,
            metaRobotsRaw: metaRobotsValue,
            siteOwner: this.renderer.cachedItems.authors[1],
            menus: this.menus,
            unassignedMenus: this.unassignedMenus
        };
    }

    getContext () {
        this.setContext();
        return this.context;
    }
}

module.exports = RendererContextCategories;
