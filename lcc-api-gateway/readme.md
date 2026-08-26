# 🛰️ LCC API Service Gateway & Token Vault (v2.0 Enterprise)

An enterprise-grade frontend API Gateway management dashboard and security vault simulation. Version 2.0 expands the software into a full developer operations console, featuring multi-token credential lifecycle management, permission scopes, active revocation controls, dynamic route proxy configuration, real-time traffic telemetry, and an interactive API request simulator sandbox.

---

## 🛠️ System Architecture & Key Modules

This software uses an event-driven Vanilla JavaScript engine decoupled from modern presentation layouts built with pure CSS custom properties and HTML5 semantic markup.

### 1. 🔒 Token Vault & Credential Management
* **Cryptographic Token Generator:** Utilizes `window.crypto.getRandomValues` to generate secure, custom-prefixed (`lcc_live_*`) production API credentials client-side.
* **Granular Permission Scopes:** Supports custom scope assignment (`production:write`, `admin:full`, `read-only`, `telemetry:ingest`).
* **Active Credential Registry:** Maintains a live table of generated tokens with parameters for client label, scope, lifecycle expiration, rate-limit throttling, key unmasking, clipboard copying, and instant token revocation (`REVOKED` state).

### 2. 🛣️ Proxy Route Configurator
* **Endpoint Rule Engine:** Defines microservice proxy routes (`/v2/users/auth`, `/v2/metrics/push`, `/v1/projects/deploy`, `/v2/billing/invoice`).
* **Mock Status Controller:** Configure status code behaviors per endpoint (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `429 Rate Limited`, `503 Maintenance`).
* **Dynamic Route Toggling & Custom Endpoints:** Enable or disable proxy routes on the fly, or register custom HTTP endpoints dynamically.

### 3. 📊 Telemetry Stream & Real-Time Analytics
* **Asynchronous Traffic Engine:** Background polling event loop simulates real-time inbound traffic streams passing through the active proxy layer.
* **Live Analytics Cards:** Real-time calculation of Total Requests, Success Rate %, Average Latency (ms), and Blocked/Failed Requests.
* **Diagnostic Log Terminal Controls:** Filter logs by level (`ALL`, `SUCCESS`, `WARNING`, `ERROR`, `SYSTEM`), pause/resume background traffic stream, clear terminal logs, or export log history to downloadable `.json` or `.csv` files.

### 4. 🧪 Interactive API Sandbox Simulator
* **Mock Request Composer:** Compose HTTP requests (`GET`, `POST`, `PUT`, `DELETE`) with custom JSON payloads against configured proxy endpoints.
* **Header Authentication Test:** Test requests with unauthenticated, active, or revoked token credentials and receive instant, formatted JSON response payloads with latency metrics.

---

## 📂 Project Directory Structure

```text
lcc-api-gateway/
│
├── gateway.html    # Tabbed navigation, vault forms, route tables, analytics cards, & sandbox UI
├── gateway.css     # Dark mode design tokens, status badges, metrics layout, & terminal styles
├── gateway.js      # Core v2.0 state registry, token engine, route manager, telemetry & sandbox
└── README.md       # Technical project documentation and system specification
```

---

## 🚀 Execution & Quick Start

1. Clone or navigate to the root directory `lcc-api-gateway/`.
2. Open `gateway.html` natively inside any modern web browser.
3. Switch between tabs:
   - **Token Vault:** Issue tokens with custom names, scopes, and expiration policies.
   - **Route Configurator:** Tweak endpoint statuses and toggle route availability.
   - **Telemetry & Metrics:** Monitor live traffic, filter logs, and export telemetry data.
   - **API Sandbox:** Execute test calls to evaluate token and route rules.

© 2026 Lukman CodeCraft (LCC). Engineered for high-velocity microservice performance and structural transparency.