# Blog Editor Link Feature

## Overview
The TipTap rich text editor in the blog form now includes comprehensive link functionality, allowing users to create, edit, and remove links within their blog content.

## Features Added

### 1. Link Creation
- **Link Button**: New link icon button in the toolbar
- **Smart Link Dialog**: Modal dialog for entering link details
- **Text Selection Support**: Works with selected text or creates new text
- **URL Validation**: Ensures proper URL format

### 2. Link Management
- **Edit Existing Links**: Click on existing links to edit them
- **Remove Links**: Unlink button to remove links while keeping text
- **Visual Feedback**: Active link button when cursor is on a link

### 3. User Experience
- **Intuitive Interface**: Simple dialog with URL and optional text fields
- **Keyboard Support**: Auto-focus on URL field for quick entry
- **Smart Defaults**: Uses selected text or URL as link text

## How to Use

### Creating a Link

#### Method 1: Link Selected Text
1. **Select text** in the editor that you want to turn into a link
2. **Click the Link button** (🔗) in the toolbar
3. **Enter the URL** in the dialog
4. **Click "Add Link"**

#### Method 2: Insert New Link
1. **Place cursor** where you want the link
2. **Click the Link button** (🔗) in the toolbar
3. **Enter link text** (optional) and **URL**
4. **Click "Add Link"**

### Editing a Link
1. **Click on an existing link** in the editor
2. **Click the Link button** (🔗) - dialog will show current URL
3. **Modify the URL** as needed
4. **Click "Add Link"** to update

### Removing a Link
1. **Click on the link** you want to remove
2. **Click the Unlink button** (🔗⚡) in the toolbar
3. **Link is removed** but text remains

## Technical Implementation

### Dependencies Added
```json
{
  "@tiptap/extension-link": "^2.25.0"
}
```

### Editor Configuration
```typescript
Link.configure({
  openOnClick: false,
  HTMLAttributes: {
    class: 'text-blue-600 underline hover:text-blue-800',
  },
})
```

### CSS Styling
```css
.ProseMirror a {
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
}

.ProseMirror a:hover {
  color: #1d4ed8;
  text-decoration: underline;
}
```

## Database Storage

Links are stored as HTML in the `paragraph` field of the `blog_posts` table:

```sql
-- Example stored content
paragraph: '<p>Check out our <a href="https://example.com">latest products</a> for more information.</p>'
```

## Features

### Link Dialog
- **URL Field**: Required field for the link destination
- **Text Field**: Optional field for custom link text
- **Smart Defaults**: 
  - Uses selected text if available
  - Falls back to URL as text if no text provided
  - Pre-fills current URL when editing existing links

### Toolbar Integration
- **Link Button**: Creates/edits links
- **Unlink Button**: Removes links (only enabled when cursor is on a link)
- **Visual States**: Buttons show active state when cursor is on a link

### Keyboard Shortcuts
- **Ctrl+K** (or Cmd+K): Open link dialog (can be added if needed)

## Security Considerations

### URL Validation
- Basic URL format validation in the frontend
- Consider adding server-side URL validation for security

### XSS Prevention
- TipTap automatically sanitizes HTML output
- Links are properly escaped in the generated HTML

## Customization Options

### Link Styling
Modify the CSS in `globals.css` to change link appearance:

```css
.ProseMirror a {
  color: your-color;
  text-decoration: your-decoration;
  /* Add custom styles */
}
```

### Link Attributes
Add custom attributes in the Link configuration:

```typescript
Link.configure({
  HTMLAttributes: {
    class: 'custom-link-class',
    target: '_blank', // Open in new tab
    rel: 'noopener noreferrer', // Security attributes
  },
})
```

## Future Enhancements

### Possible Additions
1. **Link Preview**: Show preview of the linked page
2. **Internal Links**: Special handling for internal blog/site links
3. **Link Analytics**: Track link clicks
4. **Link Validation**: Check if URLs are accessible
5. **Keyboard Shortcuts**: Add Ctrl+K shortcut for quick link creation

### Advanced Features
1. **Link Suggestions**: Auto-suggest internal pages
2. **Link Cards**: Rich preview cards for certain link types
3. **Broken Link Detection**: Warn about broken links
4. **SEO Optimization**: Automatic rel attributes for external links

## Troubleshooting

### Common Issues

1. **Link button not working**: Ensure `@tiptap/extension-link` is installed
2. **Links not styled**: Check that CSS is properly loaded
3. **Dialog not appearing**: Check for JavaScript errors in console

### Browser Compatibility
- Works in all modern browsers
- Requires JavaScript enabled
- Mobile-friendly touch interface

## Testing

### Test Cases
1. ✅ Create link with selected text
2. ✅ Create link without selected text
3. ✅ Edit existing link
4. ✅ Remove link
5. ✅ Cancel link creation
6. ✅ Link styling in editor
7. ✅ Link functionality in published content

The link feature is now fully functional and ready for use in the blog editor!
