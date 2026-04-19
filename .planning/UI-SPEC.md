# UI Specification: Quill Editor Integration

## Overview
Replace the current TinyMCE 4 editor in the Shudu web interface with Quill.js (v2.0.2). This change aims to improve performance, simplify the codebase, and provide a more modern editing experience while maintaining the existing "look and feel" of the application.

## 1. Editor Configuration
- **Library**: [Quill.js](https://quilljs.com/) v2.0.2.
- **Theme**: `snow`.
- **Target**: The `#origin` textarea in `web/index.html` will be replaced by a `div` with `id="origin-editor"`.
- **Toolbar**:
  - Header (1, 2)
  - Bold, Italic, Underline
  - List (Ordered, Bullet)
  - Link
  - Clean (Clear formatting)

## 2. Visual Design
The editor must blend seamlessly with the existing `.editor-card` design.

### Dimensions and Container
- **Min-height**: 300px (roughly equivalent to `rows="12"` of the current textarea).
- **Border Radius**: 12px for both the toolbar and the content container (using `.ql-toolbar` and `.ql-container`).
- **Border**: 1px solid `var(--border-color)` (#cbd5e1).
- **Background**: `var(--card-bg)` (#ffffff).

### Typography
- **Editor Font**: 'Inter', sans-serif (matches the rest of the application).
- **Line Height**: 1.6.

### UI Overrides (CSS)
```css
/* Customizing Quill to match Shudu design */
.ql-toolbar.ql-snow {
    border: 1px solid var(--border-color);
    border-radius: 12px 12px 0 0;
    background: #f8fafc;
}

.ql-container.ql-snow {
    border: 1px solid var(--border-color);
    border-radius: 0 0 12px 12px;
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
}

.ql-editor {
    min-height: 300px;
}
```

## 3. Interaction and Logic
- **Initialization**: Initialize Quill when the DOM is ready in `query.js`.
- **Progress State**:
  - When conversion starts, add a `loading` class to the editor container or the "立即轉換" button.
  - Disable the editor (`quill.enable(false)`) during conversion.
- **Conversion Flow**:
  1. Retrieve HTML: `const html = quill.root.innerHTML`.
  2. Parse and Convert: Use the existing logic to extract CJK text nodes from the HTML.
  3. Update Content: `quill.root.innerHTML = convertedHtml`.

## 4. Internationalization
- Quill's default tooltips are in English. If needed, we can override them using CSS or JS to match the `zh-TW` environment, although the icons are generally self-explanatory.

## 5. Accessibility
- Ensure the editor container has proper `aria` labels.
- Keyboard navigation within the toolbar should follow Quill's standard accessibility patterns.
