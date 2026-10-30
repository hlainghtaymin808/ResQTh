# ResQTh — M1 Project Charter

Team name & members (id, name): ILY3000 - ( 6931503013, Moe Pyae Pyae Aung) (6931503048, Nantarat Wonglakorn) (6931503003, Hlaing Htay Min )( 6931503122, James Aloysius)( 6931503123, Khag Ga)
## The Problem

Foreign residents in Thailand face severe communication barriers, unfamiliarity with local infrastructure, and high stress during emergency situations. Existing emergency resources are scattered, language-restricted, or difficult to navigate quickly, leading to delayed action which could worsen their existing situation whether it is a minor or major case or miscommunication with first responders. ResQTh is an AI-assisted emergency information and post-incident action guide for foreign residents and visitors in Thailand. It provides verified, location-specific emergency contacts, urgency-based action tools, natural-language emergency search, nearby facility routing, and user-controlled live location sharing with a trusted contact.
## Target Users

Foreign residents and visitors in Thailand who are unfamiliar with local emergency numbers, authorities and facilities and post-incident procedures.
## Why It Matters

High urgency: In accidents or crimes, panic makes searching for regional hotlines or copy-pasting GPS coordinates dangerously slow. Wasting critical minutes on mobile web searches or navigating separate map apps leads to delayed emergency responder dispatch and an inability to show immediate context to local bystanders. Low urgency: For post-incident issues (e.g., lost passport, non-violent theft), victims lack procedural guidance. Without step-by-step checklists or verified facility routing, they waste hours visiting the wrong police station or official office, risk missing legal reporting deadlines, and fail to log proper records for insurance or embassy claims.
## Gate 1 — Reachable Users

1. Iyar/First year liberal arts international student — in person — 24th August 2026
2. Sam Rong/First year liberal arts international student — in person — 25th August, 2026
3. Ken/First year Software Engineering international student — in person — 26th August,
2026
## Gate 2 — MVP Shape

6 planned functional requirements:
### FR-1 Detect user’s location

### FR-2 Select an emergency category

### FR-3 Display the information

### FR-4 Natural-language quick add (AI)

### FR-5 Trusted contact live location sharing

### FR-6 Finding nearby emergency facilities

## Functional Requirement with a Real Rule or Decision

### FR-4 : Instead of static database lookup, the natural language interpreter processes freeform

natural-language input through an AI parser to extract the category, province, and urgency level. It then applies a system rule that dynamically decides the UI pathway: routing high-urgency crises to immediate tools (one-tap dialing, GPS broadcast, Thai translation cards) or low-urgency situations to post-incident guidance (step-by-step checklists, facility routing) in FR-3.
## Data That Must Persist Between Sessions

Saved emergency contacts, bookmarked resolution checklists, and recent emergency query logs. Any contacts or emergency query logs need the user's consent and requirement to be saved and persist between sessions.
## Gate 3 — Access

Any data, licence or system you depend on — and how you know you can get it: ● OpenStreetMap / Mapbox API (for location & facility routing via public free tiers), ● Verified Thailand Public Emergency Hotline directory (publicly available open data), ● Natural Language interpretation capability ● External geolocation service for exact location detection and live location sharing
## Chosen SDLC

Incremental SDLC: we can build a complete project in the shortest possible time meeting MVP; at the same time, we can grow it in a flexible and adaptable manner.
