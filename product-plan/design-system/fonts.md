# Typography Configuration

## Google Fonts Import

Add to your HTML `<head>` or CSS:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap"
  rel="stylesheet"
/>
```

## Font Usage

- **Headings:** Space Grotesk — Bold, geometric, data-visualization feel. Used for zone names, section headers, big numbers, HOLC labels.
- **Body text:** Inter — Clean, highly legible. Used for descriptions, chat messages, general UI text.
- **Code/technical:** IBM Plex Mono — Used for data readouts, coordinates, TAXKEY identifiers, percentiles, source citations, timestamps.

## CSS Custom Properties

```css
--font-heading: "Space Grotesk", system-ui, sans-serif;
--font-body: "Inter", system-ui, sans-serif;
--font-mono: "IBM Plex Mono", monospace;
```

## Inline Style Pattern

The components use inline `style` attributes for font-family since this is a dark-first single-purpose application:

```tsx
style={{ fontFamily: '"Space Grotesk", system-ui, sans-serif' }}
style={{ fontFamily: '"Inter", system-ui, sans-serif' }}
style={{ fontFamily: '"IBM Plex Mono", monospace' }}
```
