const assert = require('assert');
const ContentHelper = require('../content.js');

describe('prepareExcerpt - Chinese (CJK) support', function () {
    const cnParagraph = '这是一个关于简体中文兼容性优化的长段落，用来验证摘要是否能够按照字数正确截断而不是整段输出。';

    it('truncates Chinese text by character count instead of by words', function () {
        const result = ContentHelper.prepareExcerpt(20, '<p>' + cnParagraph + '</p>');

        // Without CJK handling, split(' ') sees a single "word" and returns the
        // whole paragraph. It must now be limited to roughly 20 characters.
        assert.ok(result.includes('&hellip;'), 'truncated Chinese excerpt should end with an ellipsis');
        assert.ok(Array.from(result).length < Array.from(cnParagraph).length, 'excerpt must be shorter than the source');
        assert.ok(result.startsWith('这是一个关于简体中文兼容性优化的'), 'excerpt should keep the leading characters');
    });

    it('does not add an ellipsis when Chinese text is shorter than the limit', function () {
        const result = ContentHelper.prepareExcerpt(100, '<p>简短的中文摘要</p>');
        assert.strictEqual(result, '简短的中文摘要');
    });

    it('keeps the original word-based truncation for English text', function () {
        const result = ContentHelper.prepareExcerpt(4, '<p>The quick brown fox jumps over the lazy dog</p>');
        assert.strictEqual(result, 'The quick brown fox&hellip;');
    });

    it('respects an explicit read-more separator for Chinese text', function () {
        const text = '<p>第一段内容</p><hr id="read-more"><p>第二段内容</p>';
        const result = ContentHelper.prepareExcerpt(5, text);
        assert.ok(result.includes('第一段内容'), 'content before read-more must be kept');
        assert.ok(!result.includes('第二段内容'), 'content after read-more must not be included');
    });
});
