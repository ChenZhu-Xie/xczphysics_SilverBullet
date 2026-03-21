# Gemini Context: SilverBullet PKM Space (ETP)

This directory is a **SilverBullet (SB) Personal Knowledge Management (PKM) space**, referred to as "Enlarge The Percentage" (ETP). It is a highly customized, logic-driven notebook that uses SilverBullet's advanced features like Space Lua, Live Queries, and custom Plugs.

## Project Overview

- **Purpose:** A personal knowledge base for acquisition, processing, and distribution of information. The core philosophy, "Enlarge The Percentage," focuses on replicating the author's logic and tools to a wider audience.
- **Primary Technology:** [SilverBullet](https://silverbullet.md/) (v2/edge), a self-hosted, extensible markdown-based note-taking application.
- **Logic & Configuration:** Driven by **Space Lua**, allowing for dynamic configurations and custom commands directly within markdown files.
- **Key Features:**
  - **Custom Plugs:** Many extensions are developed in-house (located in `Library/xczphysics/`).
  - **Advanced UI:** customized mobile bottom-bar, custom themes (e.g., Doom-Two), and custom widgets.
  - **Command-Centric:** Extensive use of custom keyboard shortcuts for efficiency.

## Directory Structure & Key Files

### Core Configuration
- **`CONFIG.md`**: The central configuration file. Uses `space-lua` blocks to set up plugs, mobile UI, action buttons, and global settings.
- **`STYLE.md`**: Contains custom CSS and themes.
- **`CONFIG/KeyBinding.md`**: A comprehensive reference for all custom keyboard shortcuts (Ctrl/Shift/Alt combinations).
- **`Library/`**: Contains standard and custom-developed SilverBullet libraries.
  - `Library/xczphysics/`: The author's primary development space for custom plugs and configurations.

### Content & Philosophy
- **`index.md`**: The homepage of the space. Explains the "ETP" philosophy and provides navigation to recent thoughts and statistics.
- **`README.md`**: Technical instructions on how to install the author's libraries/plugs from GitHub.
- **`SB Basics/`**: Documentation regarding SilverBullet's infrastructure, philosophy, and tricks.
- **`🤔 Daydream/`**: A folder for personal reflections, ideas, and "dark spots" discovered by the author.

### Functional Folders
- **`QUERY/`**: Contains various saved queries for tags, tasks, and backlink management.
- **`STYLE/`**: Subfolders for specific styling elements like Fonts, Icons, and Widgets.
- **`Inbox/`**: Temporary storage for new notes or captured information.

## Usage & Development Conventions

### Editing & Writing
- **Markdown-First:** All content is written in Markdown.
- **Live Queries:** Use `${query[[ ... ]]}` syntax for dynamic content (tasks, statistics, etc.).
- **Space Lua:** Used for custom logic. Look for blocks marked with ````space-lua` or ````lua`.
- **Naming Convention:** Files often use emojis in titles (e.g., `🤔 Daydream`) or descriptive, hierarchical names.

### Shortcuts (Key Bindings)
This space relies heavily on keyboard shortcuts. Key areas to check:
- **Navigation:** `Ctrl-k` for page picker, `Ctrl-h` for home.
- **Editing:** `Alt-d` (Delete nearest format), `Alt-c` (Duplicate nearest format).
- **Search:** `Ctrl-Shift-f` for Global Search.
- *Refer to `CONFIG/KeyBinding.md` for the full exhaustive list.*

### Sync & Version Control
- The project is managed via Git (noted in `Enhanced_Git.md` within the config).
- **NEVER** stage or commit changes unless explicitly asked, as SilverBullet may have its own sync mechanisms.

## Instructional Focus for Gemini
When assisting in this space:
1.  **Respect Space Lua:** Understand that configuration is logic-based. If a change involves a command or setting, it likely resides in a `space-lua` block in `CONFIG.md` or a library file.
2.  **SilverBullet Syntax:** Be aware of SB-specific syntax like `[[Page Name]]` for links, `${template(...)}` for rendering, and `#tag` for metadata.
3.  **Philosophical Alignment:** Align with the "Enlarge The Percentage" goal of precision, conciseness, and comprehensibility.
