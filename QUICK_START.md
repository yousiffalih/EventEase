# 🚀 EventEase CI/CD - Quick Start

## What You Need to Do

Your CI/CD pipeline is configured like your friend's .NET pipeline. Follow these steps:

---

## Step 1: Set Up Runner on Your Server ⚙️

**SSH to your server in the salle and run:**

```bash
# 1. Get a fresh token first!
# Go to: https://github.com/yousiffalih/EventEase/settings/actions/runners/new
# Copy the token (expires in 1 hour)

# 2. Create and configure runner
mkdir -p ~/actions-runner && cd ~/actions-runner
curl -o actions-runner-linux-x64-2.329.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.329.0/actions-runner-linux-x64-2.329.0.tar.gz
echo "194f1e1e4bd02f80b7e9633fc546084d8d4e19f3928a324d512ea53430102e1d  actions-runner-linux-x64-2.329.0.tar.gz" | shasum -a 256 -c
tar xzf ./actions-runner-linux-x64-2.329.0.tar.gz
./config.sh --url https://github.com/yousiffalih/EventEase --token YOUR_TOKEN_HERE

# 3. Install as service
sudo ./svc.sh install
sudo ./svc.sh start
```

**Verify:** Go to https://github.com/yousiffalih/EventEase/settings/actions/runners  
You should see your runner with green "Idle" status.

---

## Step 2: Add GitHub Secrets 🔐

Go to: https://github.com/yousiffalih/EventEase/settings/secrets/actions

Add these 3 secrets:

| Name | Value |
|------|-------|
| `MONGODB_URI` | Your MongoDB connection string |
| `MONGODB_DATABASE` | `eventease_prod` |
| `JWT_SECRET` | Generate with: `openssl rand -base64 32` |

---

## Step 3: Ensure Docker is Ready 🐳

**On your server:**

```bash
# Install Docker (if not installed)
sudo apt update && sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group
sudo usermod -aG docker $USER
# Log out and back in

# Test
docker ps
```

---

## Step 4: Test the Pipeline ✅

```bash
# Make a small change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "test: trigger CI/CD"
git push origin main
```

**Watch it run:** https://github.com/yousiffalih/EventEase/actions

---

## How It Works 🔄

```
┌──────────────────────────────────────────────────┐
│  1. BUILD (GitHub Runner)                        │
│     - Compile with Maven                         │
│     - Create JAR artifact                        │
└────────────────┬─────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────┐
│  2. TEST (GitHub Runner)                         │
│     - Start MongoDB service                      │
│     - Run integration tests                      │
└────────────────┬─────────────────────────────────┘
                 │
                 ↓
┌──────────────────────────────────────────────────┐
│  3. DEPLOY (Your Server - self-hosted)           │
│     - Read version from pom.xml                  │
│     - Build Docker image: eventease-backend:X.X  │
│     - Stop old container                         │
│     - Start new container on port 8080           │
└──────────────────────────────────────────────────┘
```

---

## Useful Commands 🛠️

### On Your Server

```bash
# Check runner status
sudo ./svc.sh status

# View container logs
docker logs -f eventease-backend

# Restart container
docker restart eventease-backend

# Check running containers
docker ps

# Clean up old images
docker image prune -f
```

### Locally

```bash
# Run tests
./mvnw test

# Build
./mvnw clean package

# Run locally
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

---

## Troubleshooting 🚨

### Runner not showing up?
- Token expired? Get a new one
- Check: `sudo ./svc.sh status`
- Logs: `tail -f ~/actions-runner/_diag/*.log`

### Deployment fails?
- Docker installed? `docker --version`
- Can run without sudo? `docker ps`
- Secrets configured? Check GitHub settings
- Port 8080 free? `sudo lsof -i :8080`

### Container won't start?
- Check logs: `docker logs eventease-backend`
- Check environment: `docker inspect eventease-backend`
- MongoDB accessible? Test connection string

---

## What's Different from Your Friend's Pipeline? 🤔

| Feature | Friend (.NET) | You (Java) |
|---------|--------------|------------|
| Build | `dotnet publish` | `./mvnw package` |
| Test | `dotnet test` | `./mvnw test` |
| Version | `.csproj` | `pom.xml` |
| Port | 8001 | 8080 |
| Image | `flemot-api` | `eventease-backend` |

**Same concepts:**
- ✅ Build → Test → Deploy stages
- ✅ Self-hosted runner for deployment
- ✅ Version-based Docker tagging
- ✅ Environment file from secrets
- ✅ Stop old, start new container

---

## Next Steps 📝

1. ✅ Complete steps 1-4 above
2. ✅ Watch your first successful deployment
3. 📝 Test your API: `http://your-server-ip:8080`
4. 📝 Monitor logs and performance

---

## Need More Details?

- **Full guide**: See `CICD_SETUP_GUIDE.md`
- **Secrets help**: See `GITHUB_SECRETS_TEMPLATE.md`
- **Summary**: See `CICD_SUMMARY.md`
- **Workflow file**: `.github/workflows/ci-cd.yml`

---

**Ready to deploy? Start with Step 1! 🚀**
