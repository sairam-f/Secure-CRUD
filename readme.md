
---

# Secure-CRUD (Multi-Container Application)

## Project Overview

**Secure-CRUD** is a production-style multi-container CRUD application deployed using Docker Compose.
The system demonstrates **network isolation**, **reverse proxying**, **container security**, **persistent storage**, and **CI/CD automation**.

The application is isolated behind an **Nginx reverse proxy**, with all services running in a private Docker network.

---

## Architecture

```
Client (Browser / curl)
        |
        |  Port 80
        v
+------------------+
|  Nginx (Proxy)   |
+------------------+
        |
        |  Private Docker Network
        v
+------------------+      +------------------+
| Node.js App      | ---> | PostgreSQL DB    |
| (CRUD API)       |      | (Persistent)    |
+------------------+      +------------------+
```

### Services

| Service | Technology        | Purpose                            |
| ------- | ----------------- | ---------------------------------- |
| Proxy   | Nginx             | Public entry point, routes traffic |
| App     | Node.js (Express) | Business logic & CRUD API          |
| DB      | PostgreSQL        | Persistent data storage            |

---

## Key Features

* Full **CRUD API** (Create, Read, Update, Delete)
* **Only Nginx exposes a host port** (80)
* App & Database are **fully private**
* Database data persists using Docker volumes
* App runs as a **non-root user**
* Environment variables used for credentials
* Automated deployment with `deploy.sh`
* CI/CD pipeline using **GitHub Actions**
* Docker image published to **Docker Hub**

---

## Prerequisites

* Docker
* Docker Compose
* On Windows: **Git Bash** or **WSL** (recommended)

---

## Setup & Run

### 1. Clone the repository

```bash
git clone <your-github-repo-url>
cd secure_CRUD_assignment
```

### 2. Create `.env`

```env
DB_USER=admin
DB_PASS=secret123
DB_NAME=securecrud
```

### 3. Run the application

```bash
chmod +x deploy.sh
./deploy.sh
```

You should see:

```
[SUCCESS] Application is live at http://localhost
```

---

## API Endpoints

### Health Check

```http
GET /health
```

### Create Task

```http
POST /tasks
Content-Type: application/json

{
  "title": "My first task"
}
```

### Get All Tasks

```http
GET /tasks
```

### Update Task

```http
PUT /tasks/{id}
Content-Type: application/json

{
  "title": "Updated title",
  "done": true
}
```

### Delete Task

```http
DELETE /tasks/{id}
```

---

## Example Commands

### PowerShell

```powershell
Invoke-RestMethod http://localhost/health

Invoke-RestMethod -Method Post -Uri http://localhost/tasks `
  -ContentType "application/json" `
  -Body '{"title":"Test task"}'

Invoke-RestMethod http://localhost/tasks
```

### Git Bash / Linux / macOS

```bash
curl http://localhost/health

curl -X POST http://localhost/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Test task"}'

curl http://localhost/tasks
```

---

## Persistence Verification

Data remains available after container restarts:

```bash
docker compose down
docker compose up -d
```

Previously created tasks are still present.

---

## CI/CD Pipeline

* Triggered on push to `master`
* Builds Docker image
* Tags image as:

  * `latest`
  * commit SHA
* Pushes image to Docker Hub

---

## Docker Hub Image

[https://hub.docker.com/r/](https://hub.docker.com/r/)<your-dockerhub-username>/secure-crud

---

## Security & Best Practices

* App container runs as **non-root**
* Database credentials via environment variables
* No database or app ports exposed to host
* Reverse proxy pattern used

---

## Submission Notes

* Repository is public
* Docker image is public
* All assignment requirements satisfied

---

