# Docker TUI

A stunning, modern Terminal User Interface for monitoring and managing Docker containers, built with **Bun**, **React**, and **Ink**.

![Docker TUI](https://img.shields.io/badge/Built%20With-Bun-black?style=for-the-badge&logo=bun)
![Docker TUI](https://img.shields.io/badge/Built%20With-Ink-blue?style=for-the-badge&logo=react)
![Docker TUI](https://img.shields.io/badge/Docker-Enabled-blue?style=for-the-badge&logo=docker)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## 🌟 Features

- **Visual Appeal**: Beautiful gradients and big text headers using `ink-gradient` and `ink-big-text`.
- **Theme Support**: Toggle between Dark and Light modes with the `t` key for optimal viewing in any terminal.
- **Live Monitoring**: Real-time streaming of CPU, Memory, and Network I/O using Docker streams.
- **Multi-Resource Management**:
  - **Containers**: View, start, stop, restart, and monitor containers
  - **Images**: Browse and delete Docker images
  - **Volumes**: Inspect and remove Docker volumes
  - **Networks**: View and manage Docker networks
- **Container Control**: Start, Stop, and Restart containers directly from the UI.
- **Live Logs**: View real-time log streams for any container.
- **Search & Filter**: Press `/` to search and filter containers by name, ID, or image.
- **Keyboard Navigation**: Intuitive Up/Down arrow navigation and Vim-style keys support.
- **Smart Pagination**: Automatically paginates long lists (10 per page), preventing terminal scroll jumping.
- **Instant Feedback**: Live status indicators (Running/Exited) with color-coded feedback.
- **Performance**: Built on Bun for ultra-fast startup and execution.
- **Portable**: Single-file executables for Linux, Windows, and macOS.

---

## 🏗️ Architecture & Diagrams

### Component Map

This high-level overview illustrates how the application state flows from the Docker socket into the React components, including the new Actions and Logs modules.

```mermaid
graph TD
    subgraph UI_Layer [UI Presentation Layer]
        App[App.tsx]
        Header[Header Component]
        List[ContainerList Component]
        Details[ContainerDetails Component]
        Logs[ContainerLogs Component]
    end

    subgraph Logic_Layer [State & Logic Layer]
        useContainers[useDockerContainers]
        useStats[useDockerStats]
        useActions[useContainerActions]
        useLogs[useDockerLogs]
    end

    subgraph System_Layer [Infrastructure Layer]
        DockerAPI[Docker Socket / API]
    end

    %% Connections
    App --> Header
    App -->|View: List| List
    App -->|View: Details| Details
    App -->|View: Logs| Logs

    List --> useContainers
    Details --> useStats
    Details --> useActions
    Logs --> useLogs

    useContainers -.->|Poll| DockerAPI
    useStats -.->|Stream| DockerAPI
    useActions -.->|POST| DockerAPI
    useLogs -.->|Stream| DockerAPI

    style UI_Layer fill:#eef,stroke:#333
    style Logic_Layer fill:#efe,stroke:#333
    style System_Layer fill:#fee,stroke:#333
```

### User Interaction Flow

The following state diagram details the user experience and navigation paths, including the new Logs view.

```mermaid
stateDiagram-v2
    [*] --> Initializing : bun start
    Initializing --> FetchingData : Load Resources

    state Dashboard_View {
        [*] --> ListDisplay
        ListDisplay --> ListDisplay : Up/Down Nav
    }

    FetchingData --> Dashboard_View

    Dashboard_View --> Container_Detail_View : Enter Key

    state Container_Detail_View {
        [*] --> ConnectingStream
        ConnectingStream --> StreamingStats
        StreamingStats --> StreamingStats : Live Updates

        state Actions {
            [*] --> Idle
            Idle --> Executing : s/x/r Key
            Executing --> Idle : Success/Error
        }
    }

    Container_Detail_View --> Log_View : 'l' Key
    Log_View --> Container_Detail_View : Esc / q

    Container_Detail_View --> Dashboard_View : Esc / q
```

---

## 🎮 Key Bindings

### Navigation

| Key                       | Context         | Action                             |
| :------------------------ | :-------------- | :--------------------------------- |
| `↑` / `Up Arrow`          | List View       | Move selection up                  |
| `↓` / `Down Arrow`        | List View       | Move selection down                |
| `Enter` / `Return`        | Container List  | View details of selected container |
| `Esc` / `q` / `Backspace` | Detail/Log View | Go Back / Return to List View      |

### Tab Switching

| Key   | Action                        |
| :---- | :---------------------------- |
| `1`   | Switch to **Containers** tab  |
| `2`   | Switch to **Images** tab      |
| `3`   | Switch to **Volumes** tab     |
| `4`   | Switch to **Networks** tab    |
| `Tab` | Cycle through tabs            |
| `t`   | Toggle **Theme** (Dark/Light) |

### Container Actions

| Key | Context     | Action                |
| :-- | :---------- | :-------------------- |
| `s` | Detail View | **Start** Container   |
| `x` | Detail View | **Stop** Container    |
| `r` | Detail View | **Restart** Container |
| `l` | Detail View | View **Logs**         |

### Resource Management

| Key               | Context                 | Action                       |
| :---------------- | :---------------------- | :--------------------------- |
| `x` / `Delete`    | Images/Volumes/Networks | **Remove** selected resource |
| `/`               | Container List          | **Search/Filter** containers |
| `Esc` (in search) | Container List          | Clear search filter          |

### Global

| Key      | Action           |
| :------- | :--------------- |
| `Ctrl+C` | Exit Application |

---

## 📂 Project Structure

```bash
docker-tui/
├── bin/                 # Compiled executables
├── src/
│   ├── components/
│   │   ├── Header.tsx           # App logo and title
│   │   ├── ContainerList.tsx    # Paginated list of containers with search
│   │   ├── ContainerDetails.tsx # Live stats view + Actions
│   │   ├── ContainerLogs.tsx    # Log streaming view
│   │   ├── ImageList.tsx        # Docker images browser
│   │   ├── VolumeList.tsx       # Docker volumes inspector
│   │   └── NetworkList.tsx      # Docker networks viewer
│   ├── hooks/
│   │   ├── useDockerContainers.ts # Polling logic for container list
│   │   ├── useDockerStats.ts      # Live stats streaming
│   │   ├── useContainerActions.ts # Start/Stop/Restart logic
│   │   ├── useDockerLogs.ts       # Log streaming hook
│   │   ├── useDockerImages.ts     # Images fetching hook
│   │   ├── useImageActions.ts     # Image removal logic
│   │   ├── useDockerVolumes.ts    # Volumes fetching hook
│   │   └── useDockerNetworks.ts   # Networks fetching hook
│   ├── contexts/
│   │   └── ThemeContext.tsx       # Dark/Light theme provider
│   ├── App.tsx          # Main application logic
│   └── index.tsx        # Entry point
├── package.json
├── tsconfig.json
└── README.md
```

---

## 📦 Building Executables

You can build standalone executables for Linux, Windows, and macOS (Apple Silicon). These binaries do not require Bun or Node.js installed on the target machine.

### Build Commands

```bash
# Build for Linux (output: bin/docker-tui-linux)
bun run build

# Build for Windows (output: bin/docker-tui-windows.exe)
bun run build:win

# Build for macOS Apple Silicon (output: bin/docker-tui-macos-arm64)
bun run build:mac

# Build ALL targets at once
bun run build:all
```

The compiled binaries will be available in the `bin/` directory.

---

## 🚀 Getting Started (Development)

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
2.  You might need `sudo` permissions, even for the binary:
    ````bash
    sudo ./bin/docker-tui-linux
    3.  Or add your user to the docker group (recommended):
    ```bash
    sudo usermod -aG docker $USER
    # Log out and log back in for this to take effect

    ````
