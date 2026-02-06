# Docker TUI

A stunning, modern Terminal User Interface for monitoring and managing Docker containers, built with **Bun**, **React**, and **Ink**.

![Docker TUI](https://img.shields.io/badge/Built%20With-Bun-black?style=for-the-badge&logo=bun)
![Docker TUI](https://img.shields.io/badge/Built%20With-Ink-blue?style=for-the-badge&logo=react)
![Docker TUI](https://img.shields.io/badge/Docker-Enabled-blue?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 🌟 Features

- **Visual Appeal**: Beautiful gradients and big text headers using `ink-gradient` and `ink-big-text`.
- **Live Monitoring**: Real-time streaming of CPU, Memory, and Network I/O using Docker streams.
- **Keyboard Navigation**: Intuitive Up/Down arrow navigation and Vim-style keys support.
- **Smart Pagination**: Automatically paginates long lists of containers (10 per page), preventing terminal scroll jumping.
- **Instant Feedback**: Live status indicators (Running/Exited) with color-coded feedback.
- **Performance**: Built on Bun for ultra-fast startup and execution.

---

## 🏗️ Architecture & Diagrams

### Component Map

This high-level overview illustrates how the application state flows from the Docker socket into the React components.

```mermaid
graph TD
    subgraph UI_Layer [UI Presentation Layer]
        App[App.tsx]
        Header[Header Component]
        List[ContainerList Component]
        Details[ContainerDetails Component]
        Pagination[Pagination Logic]
    end

    subgraph Logic_Layer [State & Logic Layer]
        useContainers[useDockerContainers Hook]
        useStats[useDockerStats Hook]
        Parser[Data Parsers & Formatters]
    end

    subgraph System_Layer [Infrastructure Layer]
        DockerAPI[Docker Socket / API]
        BunRuntime[Bun Runtime]
    end

    %% Connections
    App --> Header
    App -->|Switch View| List
    App -->|Switch View| Details

    List --> Pagination
    List --> useContainers
    Details --> useStats
    Details --> Parser

    useContainers -.->|Poll Interval: 2s| DockerAPI
    useStats -.->|Live Stream| DockerAPI

    style UI_Layer fill:#eef,stroke:#333,stroke-width:2px
    style Logic_Layer fill:#efe,stroke:#333,stroke-width:2px
    style System_Layer fill:#fee,stroke:#333,stroke-width:2px
```

### User Interaction Flow

The following state diagram details the user experience and navigation paths.

```mermaid
stateDiagram-v2
    [*] --> Initializing : bun start
    Initializing --> FetchingData : Load Resources

    state Dashboard_View {
        [*] --> ListDisplay
        ListDisplay --> ListDisplay : Up/Down Arrow (Nav)
        ListDisplay --> ListDisplay : Auto-Refresh (Background)
        ListDisplay --> ListDisplay : Page Change (Auto)
    }

    FetchingData --> Dashboard_View : Success
    FetchingData --> ErrorState : Socket Error

    Dashboard_View --> Container_Detail_View : Enter Key

    state Container_Detail_View {
        [*] --> ConnectingStream
        ConnectingStream --> StreamingStats : Connected
        StreamingStats --> StreamingStats : Update UI (Real-time)
    }

    Container_Detail_View --> Dashboard_View : Esc / q / Backspace
```

### Data Refresh Cycle

How the application keeps data fresh without overwhelming the system.

```mermaid
sequenceDiagram
    participant UI as ContainerList UI
    participant Hook as useDockerContainers
    participant Docker as Docker Daemon

    UI->>Hook: Mount
    Hook->>Docker: listContainers()
    Docker-->>Hook: [Container A, Container B...]
    Hook-->>UI: Update State (Loading -> Ready)

    loop Every 2 Seconds
        Hook->>Docker: listContainers()
        Docker-->>Hook: [Container A, Container B...]
        Hook-->>UI: SetContainers(updated_list)
        Note right of UI: React Re-renders only changed items
    end
```

---

## 🎮 Key Bindings

| Key                | Context     | Action                             |
| :----------------- | :---------- | :--------------------------------- |
| `↑` / `Up Arrow`   | List View   | Move selection up                  |
| `↓` / `Down Arrow` | List View   | Move selection down                |
| `Enter` / `Return` | List View   | View details of selected container |
| `Esc`              | Detail View | Return to List View                |
| `q`                | Detail View | Return to List View                |
| `Backspace`        | Detail View | Return to List View                |
| `Ctrl+C`           | Global      | Exit Application                   |

---

## 📂 Project Structure

```bash
docker-tui/
├── src/
│   ├── components/
│   │   ├── Header.tsx          # App logo and title
│   │   ├── ContainerList.tsx   # Paginated list of containers
│   │   └── ContainerDetails.tsx # Live stats view
│   ├── hooks/
│   │   ├── useDockerContainers.ts # Polling logic for container list
│   │   └── useDockerStats.ts      # Streaming logic for stats
│   ├── index.tsx               # Entry point
│   └── App.tsx                 # Main layout & router
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Bun**: v1.0 or higher
- **Docker**: Docker Daemon must be running

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/docker-tui.git

# Enter directory
cd docker-tui

# Install dependencies
bun install
```

### Usage

Run the TUI directly with Bun:

```bash
bun start
```

For development with hot-reload:

```bash
bun run dev
```

---

## 🔧 Troubleshooting

### "connect ENOENT /var/run/docker.sock"

**Cause:** The application cannot find or access the Docker socket.
**Fix:**

1.  Ensure Docker is running (`systemctl status docker` or Check Docker Desktop).
2.  You might need `sudo` permissions:
    ```bash
    sudo bun start
    ```
3.  Or add your user to the docker group (recommended):
    ```bash
    sudo usermod -aG docker $USER
    # Log out and log back in for this to take effect
    ```

### "Permission denied"

**Cause:** Your user does not have read/write access to the docker socket.
**Fix:** Follow step 3 above to add your user to the `docker` group.

---

## 🔮 Future Roadmap

- [ ] **Container Actions**: Start, stop, and restart containers directly from the UI.
- [ ] **Log Viewing**: Stream logs for a specific container in a separate view.
- [ ] **Image Management**: List, pull, and delete Docker images.
- [ ] **Volume Inspector**: View volume mounting details.
- [ ] **Dark/Light Mode**: Toggle color themes.

---

Built with ❤️ by [Your Name] using **Bun**.
