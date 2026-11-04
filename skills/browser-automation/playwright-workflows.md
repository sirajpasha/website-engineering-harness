# PLAYWRIGHT BROWSER AUTOMATION WORKFLOWS (skills/browser-automation/)

## 1. Overview
This skill operationalizes real-browser verification using Playwright MCP, Playwright CLI, and Playwright Test across the 6 standard viewports.

## 2. Mandatory Viewport Configurations
```javascript
export const standardViewports = [
  { name: 'mobile-compact', width: 360, height: 800 },
  { name: 'mobile-modern', width: 390, height: 844 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'desktop-standard', width: 1440, height: 900 },
  { name: 'desktop-fhd', width: 1920, height: 1080 }
];
```

## 3. Automated Browser Checks
In each viewport, automation scripts must verify:
1. **Horizontal Scroll Check:**
   ```javascript
   const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
   const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
   expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
   ```
2. **Interactive States:** Click all buttons, navigation triggers, modal openers.
3. **Console Hygiene:** Collect all `page.on('console')` and `page.on('pageerror')` events. Fail the test if unhandled errors exist.
4. **Network Hygiene:** Track all network requests. Fail if any local assets (CSS, JS, fonts, images) return HTTP 4xx or 5xx.
