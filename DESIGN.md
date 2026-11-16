---
name: Community Hub
description: A community-centered communication platform, presented like a presentation: one full screen per page, turned one at a time.
colors:
  ink: "#152019"
  pine: "#123a29"
  leaf: "#467d58"
  lime: "#c9db87"
  lime-deep: "#b9cd70"
  lime-pale: "#f2f6e1"
  paper: "#ffffff"
  field: "#f4f6f1"
  line: "#e2e6dd"
  water: "#e2ece8"
  sky: "#2f6f7d"
  sand: "#d6c8ae"
typography:
  display:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.375rem, 5.2vw, 4.75rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.032em"
  headline:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 4.6vw, 3.75rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 3.6vw, 3rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.026em"
  subtitle:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 1.9vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.016em"
  lede:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1.45vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Figtree, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  wordmark:
    fontFamily: "Comfortaa, Figtree, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
rounded:
  field: "0.75rem"
  card: "1rem"
  frame: "1.25rem"
  panel: "clamp(1.25rem, 2.2vw, 1.75rem)"
  pill: "999px"
spacing:
  header: "4rem"
  gutter: "clamp(1.25rem, 4vw, 2.5rem)"
  container: "80rem"
  section: "clamp(4.5rem, 9vw, 8rem)"
  page-pad: "clamp(2rem, 5vh, 3.5rem)"
components:
  button-primary:
    backgroundColor: "{colors.lime}"
    textColor: "{colors.pine}"
    rounded: "{rounded.pill}"
    padding: "0 1.5rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.lime-deep}"
    textColor: "{colors.pine}"
  button-secondary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.pine}"
    rounded: "{rounded.pill}"
    padding: "0 1.375rem"
    height: "3rem"
  button-secondary-hover:
    backgroundColor: "{colors.field}"
    textColor: "{colors.pine}"
  button-on-dark:
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0 1.375rem"
    height: "3rem"
  link:
    textColor: "{colors.leaf}"
  field:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "0 1rem"
    height: "3rem"
  round-control:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.pine}"
    rounded: "{rounded.pill}"
    size: "2.75rem"
---

# Design System: Community Hub

## Overview

**Creative North Star: "The Civic Brochure"**

Community Hub sells a community-centered communication platform to cities, neighborhoods, schools, campuses and museums. The site reads like a well-made town brochure: one idea per page, turned one page at a time, with the real film, real places and real people doing the persuading. The look is the category standard played straight at Apple's level of finish: a white page, Community Hub's own greens, one lime action, generous space, and photography and live dashboards as the only decoration.

Density is low and deliberate. Every page answers one question a buyer has (what is it, who is it for, what does it do, does it work, what does it cost, how do I start) and ends in Contact us. Words are plain and come from the content the team already wrote; the site never invents claims, prices or awards.

**Key Characteristics:**
- A white page; pine type; leaf links; lime only for the one primary action.
- Figtree for every word; Comfortaa only in the wordmark beside the hands-holding-a-town mark.
- On the home page, each section is a full screen that snaps into place, like turning a page.
- Real media leads: the hero film, installation photos, live dashboards and calendars, the Community Voices players.
- Flat surfaces separated by hairlines and tinted page bands, not shadows.

## Colors

Community Hub's greens on white, with lime kept rare so the next step is always obvious.

### Primary
- **Town Lime** (#c9db87): the Contact us pill, the "act locally / thinking globally" words in the film, the lime line in the contact panel. Hover deepens to **Lime Deep** (#b9cd70).
- **Pine** (#123a29): headings, the contact panel, active tab underlines, filled controls on hover.

### Secondary
- **Leaf** (#467d58): every link and the focus ring. 4.85:1 on white.

### Neutral
- **Ink** (#152019): body text; muted text is ink at 70–80%, never gray.
- **Paper** (#ffffff): the page.
- **Field** (#f4f6f1): the footer and the "What it changed" page band; product panels behind photos.
- **Lime Pale** (#f2f6e1): the "What people say" page band.
- **Line** (#e2e6dd): hairlines between sections, tab rows, bundle columns.
- **Water, Sky, Sand** (#e2ece8, #2f6f7d, #d6c8ae): legacy accents kept for older product illustrations; not for new UI.

### Named Rules
**The One Lime Rule.** Lime marks the single primary action on a screen (Contact us) and the two highlighted words of the film. Nothing else is lime.

**The Page Is the Frame Rule.** A reserved media box paints nothing of its own. A photo that does not fill its box sits in it at its own shape with rounded corners, on the page's own background, so no second background shows around it.

## Typography

**Display and body:** Figtree (Google Fonts, 400–800), with ui-sans-serif fallback.
**Wordmark only:** Comfortaa 700.

**Character:** One friendly geometric sans for everything keeps the site calm and readable at every size; weight and size carry the hierarchy, never color tricks.

### Hierarchy
- **Display** (600, clamp(2.375rem, 5.2vw, 4.75rem), 1.02, −0.032em): the film's headline only.
- **Headline** (600, clamp(2.25rem, 4.6vw, 3.75rem), 1.05): page titles (`t-h1`).
- **Title** (600, clamp(1.875rem, 3.6vw, 3rem), 1.08): section and brochure-page titles (`t-h2`).
- **Subtitle** (600, clamp(1.25rem, 1.9vw, 1.5rem), 1.2): product names, card titles (`t-h3`).
- **Lede** (400, clamp(1.125rem, 1.45vw, 1.3125rem), 1.5, ink 78%): the sentence under a title (`t-lede`).
- **Body** (400, 1.0625rem, 1.6): running text, max about 70ch (`t-body`).
- **Small / Label** (0.9375rem / 0.875rem 600): captions, footer links, column labels (`t-small`, `eyebrow`).

### Named Rules
**The No Kicker Rule.** Nothing sits above a heading: no eyebrow, no category label, no section number. A place's kind goes beside or after its name.

## Layout

- **Container:** `wrap`, max 80rem with a fluid gutter of clamp(1.25rem, 4vw, 2.5rem). The header, every section and the footer share it, so edges line up down the page.
- **Header:** fixed, 4rem, white with a hairline; content starts below it.
- **Pages, one screen each (every page but the legal ones):** each section is a page exactly one screen tall (`100svh` minus the header), composed like a presentation slide: a heading row, then one part (`.page-fill`) that takes all the height left, so nothing leaves an empty bottom half. Pages snap firmly into place (`y mandatory`, one page per scroll or swipe). Long reading pages (Research, Toolkit, Resources) and, on phones, the inner pages snap only near a section start (`deck-soft`, `y proximity`), so a long section scrolls freely. A section that cannot fit still scrolls inside before the next turn. The film is the front cover; the closing page is the back cover, a full-bleed photo of a town (downtown Oberlin from the air, or the Chalk Walk on pages that already show the aerial); the footer follows.
- **No page dots.** The owner removed the side rail (2026-11-16): the scroll or swipe is the turn.
- **Rows of several items** (results, bundles): columns on wide screens; on phones a sideways swipe strip with the next card peeking.
- **Who it's for:** tall full-bleed photo cards (place name, line and link over a dark scrim) in a row that runs to the screen's edges and scrolls sideways; round arrows either side move one card on wide screens, a swipe moves them on touch. Each card's photo appears nowhere else on the home.
- **No picture twice on a page.** A photo used in one place on a page is not used again on that page (the closing photo changes on pages that already show it).
- **Document pages** (About, Pricing, Research, Story, Toolkit, Resources, Products): normal scrolling, sections separated by a hairline and clamp(3rem, 6vw, 4.5rem) of space, ending with the contact panel and footer.
- **Product pages:** first screen pairs the product (icon, name, lede, Contact us, live link) with its live example; later sections alternate text and examples; "More in {group}" lists sibling products before the contact panel.
- **Breakpoints:** 640px (two columns), 768px (phone to tablet; strips become columns), 1024px (desktop navigation, side-by-side compositions).

## Elevation & Depth

Flat by default. Depth comes from page bands (white, field, lime pale, pine) and hairlines. Shadows appear only where something floats over other content.

### Shadow Vocabulary
- **Floating control** (`0 1px 2px rgb(10 30 20 / .1), 0 6px 16px -4px rgb(10 30 20 / .22)`): white arrow and pause circles over photos and live examples.
- **Menu drop** (`0 28px 48px -28px rgb(18 58 41 / .22)`): the Products menu under the header.

## Shapes

- Photo and example frames: 1.25rem. Big photo panels and the film: clamp(1.25rem, 2.2vw, 1.75rem). Cards: 1rem. Fields: 0.75rem. Buttons and round controls: full pill.
- Lines are 1px hairlines in Line (#e2e6dd); tab underlines are 2px pine.
- No colored side borders, no offset block shadows, no gradient text.

## Components

### Buttons
- **Primary:** lime pill, pine text, 3rem tall, 1.5rem side padding, weight 600; hover Lime Deep; press scales to .98. Label is always the action ("Contact us", "Send message").
- **Secondary:** white pill with a pine 22% hairline; hover fills Field.
- **On dark:** translucent dark pill with a white hairline, for the film and the contact panel.
- **Links:** leaf, 600, underline at 45% that goes solid on hover, often with a trailing arrow.

### Header and navigation
- Wordmark left; Products (menu), Implementations, Pricing, Research, Story, About; lime Contact us pill right.
- Products opens a full-width panel: the three groups (Engage, Educate, Motivate and Empower), each product with its icon, name and one-line description.
- Phones: a full-screen sheet with large rows, Products expanding in place, Contact us pinned at the bottom with the email address.

### Category tabs (signature)
- Underline tab bar (ARIA tabs, arrow keys) over a hairline; the chosen product shows its icon, name, one plain sentence, "Learn more", and its live example.

### Example frames (signature)
- A fixed-shape reserved box (16:10) for photos, live dashboards, calendars, slide stories and Community Voices players. Arrows sit on both sides of the example; Pause sits below it at the right, sharing its row with the caption. Examples advance on their own only while visible and never while the visitor is hovering, focused or reading.

### What people say (signature)
- Photo and quote side by side; the arrows sit on both sides of the whole quote; dots and Pause below. Quotes change with a short blur-and-rise.

### The identity row (signature)
- The product family's icons overlap with the Community Hub mark on top in the middle, and assemble outward from it (mark, then each pair) every time the row comes into view.

### Contact panel
- A pine panel: "Bring Dashboard to Your Community", the lime line "Community engagement is community building.", Contact us, the implementation guide, the email address and the workshop photo. Ends every page.

### Inputs
- White, 3rem tall, 0.75rem radius, ink 50% border (visible at 3:1), leaf focus ring; errors in #b42318 under the field, wired with aria-describedby.

### Contact and booking
- One form card with a two-option switch, "Send a message | Book a demo" (`/contact?mode=demo` opens the second). Bookings ask for a day (from tomorrow), a time window, the visitor's time zone and how to meet. Both deliver to `site.formInbox`; bookings attach a calendar file. "Book a demo" sits beside Contact us on the film, product pages, the contact panel and the phone menu, always as the secondary button.

### Implementations
- The index groups the five places under their audiences, each a photo card with its kind beside its name, "Read the story" and the live link. A place page has a back link, the name and kind, a Story / Live tab pair (`?view=live`), the story with its quote and photos, previous and next places, then the contact panel. The implementation guide is a reading page: a sticky contents list, a ~73-character measure and full-width figures.

## Do's and Don'ts

### Do:
- **Do** end every page with Contact us, and keep the lime pill the only lime on screen.
- **Do** show the real thing: the film, installation photos and live embeds before any description.
- **Do** keep each home page to one idea that fits a screen; move extra items into a swipe strip on phones.
- **Do** pause anything that moves on its own when the visitor hovers, focuses or asks for reduced motion.
- **Do** take every word from the content modules (`copy`, `pc`, `implementations`, `contactContent`) so the editor can change it.

### Don't:
- **Don't** paint a background behind a photo that doesn't fill its box.
- **Don't** put a label, number or category above a heading.
- **Don't** invent prices, client counts or awards; pricing is on request.
- **Don't** use gradient text, glassy cards, colored side borders or block shadows.
- **Don't** use a second display face; Comfortaa is the wordmark and nothing else.
