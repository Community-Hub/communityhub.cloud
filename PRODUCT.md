# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Buyers, all of the audiences the site already names (owner, Nov 15: "all on the website"):

- **Cities and towns:** sustainability coordinators, communications staff and city leaders who want residents to see live electricity, water and air data and to share events.
- **Neighborhoods:** neighborhood organizations and business districts (MidTown Cleveland) that need one place for events, jobs and news across shops, clinics, pantries and housing.
- **Colleges and campuses:** sustainability offices and residence life running dorm competitions, orbs and campus stories.
- **K-12 schools:** districts, curriculum directors and teachers who want hallway screens, live building data and the 35 free lessons.
- **Museums and science centers:** exhibit teams that want live regional data and stories (Great Lakes Science Center).

Secondary: residents, students and visitors who meet the screens, phones and embedded calendars.

## Product Purpose

communityhub.cloud sells Community Hub, a community-centered communication platform. The products, in the site's own groups:

- **Engage:** Digital Signage, Phone App, Web Embeddables.
- **Educate:** Building Dashboard, Citywide Dashboard, Data Hub, Stories.
- **Motivate and Empower:** Community Calendar, Community Voices.
- **Services:** data design and graphic design.

Success: a visiting buyer understands what Community Hub does, sees it working in real places, trusts the research behind it, finds what fits their kind of place, and contacts Community Hub. The main action is **Contact us** (owner's choice).

## Positioning

Community Hub grew out of Environmental Dashboard, research at Oberlin College on what people do when they can see the energy and water they use (dorm competitions from 2006 to 2009; 18 papers, including empathetic character gauges). It puts a community's live resource data, its events and its neighbors' own words on the same public screens, phones and websites. It runs today in Oberlin (city, college, public schools), in MidTown Cleveland (10 partner locations by January 2026) and at the Great Lakes Science Center.

## Operating Context

- **Codebase:** React + TanStack Start (Vite, Nitro). A CMS editor at editor.communityhb.tech overrides built-in copy by stable keys. The app also has legacy redirects, a generated sitemap and a `/healthz` route.
- **Live site is newer than GitHub.** Production was deployed from local code on 2026-11-12. That build has three pieces GitHub's master (Nov 5) lacks, and the redesign rebuilds them from the live site (owner's choice):
  - a contact form that posts to `/api/contact` and emails through Resend (`RESEND_API_KEY`, `MAIL_FROM`, default sender website@communityhub.cloud)
  - `/implementations` with five case pages (City of Oberlin, MidTown Cleveland, Oberlin Public Schools, Oberlin College, Great Lakes Science Center); `/who`, `/work` and `/demos` redirect there
  - `/bring-dashboard-to-your-community`, the implementation guide (John E. Petersen, revised 3/22/16) with its PDF
- **Live content the pages embed:** dashboards and calendars from oberlin, cleveland and glsc.communityhub.cloud and environmentaldashboard.org, Google Slides stories, and Community Voices players.
- **Contact:** connect@communityhub.cloud. Legal: privacy@ and info@communityhub.cloud. Community Hub Inc, Oberlin, Ohio.
- **Pricing:** three bundles (Communications, Data, Pro), cloud-hosted with an annual fee, pricing on request. No prices are published, and a test enforces this.
- **Deploy:** Vercel project `communityhub-cloud` (team Community Hub). Redesign work happens on branch `redesign` of Community-Hub/communityhub.cloud and goes to a preview link first; production switches only on the owner's OK.

## Capabilities and Constraints

- **Keep everything.** Every page, every piece of copy (in the CMS-registered content objects, with stable keys), every photo and video, every live embed and interactive demo (phone controller, story players, Community Voices players, sliders), the legacy redirects and the sitemap.
- **Assets to bring back.** Many assets exist but no page uses them, and they can return in service of selling:
  - the Environmental Orb set
  - the Ecolympics results
  - the character gauges (Wally, Flash)
  - the team photos
  - the Story of the Dashboard slides
- **Stay true.** No invented claims, prices, customers or awards. "Award-winning" names no award; do not amplify it.

## Brand Commitments

- Name: **Community Hub** (settle the "CommunityHub" spelling to "Community Hub").
- Mark: Community Hub's logo, hands holding a town inside a ring (`/assets/icon-ch.png`).
- Look: offered bolder directions, the owner chose the category standard (canon) on the options page, with Apple as the polish bar (2026-11-15). Execute the convention at full craft, no smuggled quirk.
- Voice: plain and human. The owner rejects stiff, machine-sounding copy.

## Evidence on Hand

- **Named testimonials (8):**
  - Grace Gao, Oberlin College student
  - Kim Koos, elementary teacher
  - Scott Volmer, Great Lakes Science Center
  - Bob Mendenhall, Toledo
  - Janet Haar, Oberlin Business Partnership (two quotes)
  - Linda Arbogast, City of Oberlin
  - Geoff Hunter, Palmer Conservation Consulting
- **Organisation quotes:** Dave's Market, the Oberlin Business Partnership and Palmer.
- **Research:**
  - 18 publications, 10 of them featured
  - 2007 study: electricity fell 32%, 55% with live feedback against 31% with weekly readings
  - Prospect Elementary cut electricity by more than 30% in 2014 and 2015
  - 2024 Ecolympics: the town saved 10,050 kWh against a 10,000 kWh goal
  - 2025 study of 969 people; sign surveys of 174 people before and 133 after
- **Places:** Oberlin (24 interactive screens named in legacy copy), Oberlin College, Oberlin Public Schools, MidTown Cleveland, Great Lakes Science Center, Toledo (44 school buildings, in a quote).
- **Supporters:** U.S. EPA, Great Lakes Protection Fund, Cleveland Foundation, Andrew W. Mellon Foundation via GLCA.
- **Team (About, "Our team", since the 2026-11-19 review):** John Petersen (Director), Ethan Woodfill (Project Manager), Madeleine Faubert (Design and Media), Gaurav Bora, Pratyush Bharti and Hitesh Jangid (Software Engineers), as on the original site's team page. The owner has not yet confirmed the list is current.
- **Media:**
  - the hero film (`hero-ch-fwd.mp4`, 17.9 s: globe → downtown Oberlin → people waving)
  - community photo sets (Big Parade 2023, Juneteenth 2022, Oberlin Farmers Market 2025, Oberlin College students 2025, Green Team 2026)
  - signage installation photos, Citywide Dashboard art, gauges, orbs and Ecolympics boards
- **Absent, and not to be fabricated:** prices, client counts beyond the figures above, named awards, logos of clients not already shown.

## Product Principles

1. **Show it working.** Live dashboards and real installations prove more than any claim.
2. **Every buyer finds their place.** City, neighborhood, campus, school or museum each gets a clear path.
3. **Evidence over adjectives.** Lead with research findings and real numbers.
4. **Contact is always one click away.**

## Accessibility & Inclusion

WCAG 2.2 AA for public-sector and school buyers. Respect reduced motion. Moving media that starts on its own must stop within five seconds or offer a pause; the current hero film has no pause control.
