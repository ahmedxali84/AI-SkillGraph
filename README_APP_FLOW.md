# SkillGraph: Application Flow Guide

This document maps out the core application flow, from the moment a user signs in to the completion of high-magnitude technical audits.

## 1. Authentication (Portal Access)
- **Path:** `/auth`
- **Flow:** 
  - User lands on the SkillGraph AI index page and clicks to log in.
  - They provide a Username and verify their identity.
  - Global `Zustand` state initializes: `isLoggedIn` becomes `true`, and the `username` is locked in.
  - Automatically routes the user to the Command Station.

## 2. Command Station (Dashboard)
- **Path:** `/dashboard`
- **Flow:**
  - Acts as the central hub (Bento Grid layout).
  - Displays **Global Magnitude Sync (XP)**, Verified Skills count, and Active Operations.
  - Contains a "Verification Wall" tracking recently audited proofs.
  - The floating Side Navigation (Command, Audit, Launch, Identity) remains persistently accessible.

## 3. Intelligence Audit (Submit Proofs)
- **Path:** `/upload`
- **Flow:**
  - **Inputs:** Users select an upload method (GitHub URL, Local ZIP, or Cloud Drive Link).
  - **Context:** They define a brief technical narrative.
  - **AI Analysis:** The request is sent to the backend (`/analyze-project`). 
  - **Synthesis:** The Python AI Agent orchestrates strategic assets, extracts parameters, and verifies logic.
  - **Verification:** Returns detected skills, XP (Magnitude), and difficulty. The global state `projects` and `skills` arrays are updated instantly.

## 4. Mission Hub (Daily Tasks)
- **Path:** `/tasks`
- **Flow:**
  - Users click "Generate Missions" to ping the backend (`/generate-tasks`).
  - The AI Agent assesses the user's top-verified skills and curates hyper-specific challenges (e.g., "Refactor state management in React").
  - Users mark tasks as verified to earn additional XP points.

## 5. Venture Launchpad
- **Path:** `/launchpad`
- **Flow:**
  - Users initialize a completely new architectural venture by uploading an MVP or PDF blueprint.
  - **Analysis Phase:** AI decomposes the architectural DNA and builds a 5-phase execution roadmap.
  - **Focus Directives:** Users receive step-by-step tasks to complete the roadmap.
  - **Evolution:** Upon completing a phase, the user clicks "Evolve Protocol" to synthesize the next level of features dynamically.

## 6. Identity Architect (Public Profile & Smart Resume)
- **Path:** `/profile` and `/p/[username]` and `/resume`
- **Flow:**
  - **Sync Identity:** Inside `/profile`, users trigger the "Identity Architect" to merge raw CV text with SkillGraph verified logic.
  - **Public Node:** External visitors can view `/p/[username]` to see the verified XP, Project Nodes, and Skill Array of the user.
  - **Resume Export:** In `/resume`, a sleek, executive-level resume is dynamically rendered based on the Global Store context. The user can export this verified intelligence as a PDF (`jsPDF` + `html2canvas`).
