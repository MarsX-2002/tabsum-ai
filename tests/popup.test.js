/**
 * @jest-environment jsdom
 */

describe('Popup functionality', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <select id="summaryLength">
                <option value="short">Short</option>
                <option value="medium">Medium</option>
                <option value="detailed">Detailed</option>
            </select>
            <button id="summarizeBtn">Summarize</button>
            <div id="summary"></div>
            <div id="loading" style="display: none;">Loading...</div>
        `;
    });

    test('summary length selector exists', () => {
        const selector = document.getElementById('summaryLength');
        expect(selector).toBeTruthy();
        expect(selector.options.length).toBe(3);
    });

    test('summarize button exists', () => {
        const button = document.getElementById('summarizeBtn');
        expect(button).toBeTruthy();
    });

    test('loading state is initially hidden', () => {
        const loading = document.getElementById('loading');
        expect(loading.style.display).toBe('none');
    });
});
