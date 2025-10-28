# EventEase CI/CD Setup Guide

## 📋 Overview

This CI/CD pipeline follows a **3-stage workflow** similar to your friend's .NET setup:

1. **BUILD** - Compile the application with Maven
2. **TEST** - Run integration tests with MongoDB
3. **DEPLOY** - Deploy to your self-hosted server with version-based Docker images

## 🏗️ Pipeline Architecture

```
┌─────────────┐
│   BUILD     │  ← Runs on GitHub-hosted runner (ubuntu-latest)
│  (Maven)    │     Compiles code, creates JAR artifact
└──────┬──────┘
       │
       ↓
┌─────────────┐
│    TEST     │  ← Runs on GitHub-hosted runner (ubuntu-latest)
│  (MongoDB)  │     Runs integration tests with MongoDB service
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   DEPLOY    │  ← Runs on YOUR self-hosted runner (your server)
│  (Docker)   │     Builds & deploys versioned Docker container
└─────────────┘
```

## 🔧 Setup Steps

### Step 1: Set Up Self-Hosted Runner on Your Server

You need to install a GitHub Actions runner on your server in the salle.

#### 1.1 Get a Fresh Runner Token

1. Go to: https://github.com/yousiffalih/EventEase/settings/actions/runners/new
2. Select **Linux**
3. Copy the token (it expires in ~1 hour)

#### 1.2 SSH to Your Server and Run:

```bash
# SSH to your server
ssh your-username@your-server-ip

# Create runner directory
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download runner
curl -o actions-runner-linux-x64-2.329.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.329.0/actions-runner-linux-x64-2.329.0.tar.gz

# Validate hash
echo "194f1e1e4bd02f80b7e9633fc546084d8d4e19f3928a324d512ea53430102e1d  actions-runner-linux-x64-2.329.0.tar.gz" | shasum -a 256 -c

# Extract
tar xzf ./actions-runner-linux-x64-2.329.0.tar.gz

# Configure (replace YOUR_TOKEN with the token from step 1.1)
./config.sh --url https://github.com/yousiffalih/EventEase --token YOUR_TOKEN

# Install as a service (recommended)
sudo ./svc.sh install
sudo ./svc.sh start
```

#### 1.3 Verify Runner is Active

Go to: https://github.com/yousiffalih/EventEase/settings/actions/runners

You should see your runner with a green "Idle" status.

### Step 2: Configure GitHub Secrets

Add these secrets to your GitHub repository:

1. Go to: https://github.com/yousiffalih/EventEase/settings/secrets/actions
2. Click **New repository secret**
3. Add the following secrets:

| Secret Name | Description | Example Value |
|-------------|-------------|---------------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://user:pass@host:27017/eventease` |
| `MONGODB_DATABASE` | Database name | `eventease_prod` |
| `JWT_SECRET` | JWT secret key for authentication | `your-super-secret-jwt-key-here` |

### Step 3: Ensure Docker is Installed on Your Server

```bash
# Check if Docker is installed
docker --version

# If not installed:
sudo apt update
sudo apt install -y docker.io

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (to run without sudo)
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
```

### Step 4: Test the Pipeline

1. Make a small change to your code
2. Commit and push to `main` or `develop` branch:
   ```bash
   git add .
   git commit -m "test: trigger CI/CD pipeline"
   git push origin main
   ```
3. Go to: https://github.com/yousiffalih/EventEase/actions
4. Watch the pipeline run!

## 🔄 How It Works

### Build Job (GitHub Runner)
- Checks out your code
- Sets up Java 17 with Maven cache
- Compiles the project: `./mvnw clean package -DskipTests`
- Uploads the JAR as an artifact

### Test Job (GitHub Runner)
- Starts a MongoDB 8.0 service container
- Downloads the JAR artifact from build job
- Runs integration tests: `./mvnw test`
- Uploads test results (available for 30 days)

### Deploy Job (Your Server)
- **Only runs on `main` or `develop` branches**
- Creates `.env.prod` file with secrets
- Extracts version from `pom.xml` (e.g., `0.0.1-SNAPSHOT`)
- Stops and removes old container
- Builds new Docker image tagged with version: `eventease-backend:0.0.1-SNAPSHOT`
- Starts new container on port 8080
- Cleans up old Docker images

## 📦 Version Management

The pipeline automatically reads the version from your `pom.xml`:

```xml
<version>0.0.1-SNAPSHOT</version>
```

Each deployment creates a Docker image tagged with this version:
- `eventease-backend:0.0.1-SNAPSHOT`
- `eventease-backend:latest`

To deploy a new version:
1. Update the version in `pom.xml`
2. Commit and push
3. The pipeline will automatically use the new version

## 🐳 Docker Container Details

The deployed container:
- **Name**: `eventease-backend`
- **Port**: `8080` (mapped to host port 8080)
- **Environment**: Loaded from `.env.prod` (created from GitHub secrets)
- **Image**: Built from `EventEase/backend/Dockerfile`

## 🔍 Monitoring & Debugging

### View Runner Status
```bash
# On your server
cd ~/actions-runner
sudo ./svc.sh status
```

### View Runner Logs
```bash
# On your server
tail -f ~/actions-runner/_diag/*.log
```

### View Container Logs
```bash
# On your server
docker logs eventease-backend
docker logs -f eventease-backend  # Follow logs
```

### Check Running Containers
```bash
docker ps
```

### Restart Container Manually
```bash
docker restart eventease-backend
```

### Stop Container
```bash
docker stop eventease-backend
```

## 🚨 Troubleshooting

### Runner Not Appearing in GitHub
- Check token hasn't expired (they expire in ~1 hour)
- Verify runner service is running: `sudo ./svc.sh status`
- Check runner logs: `tail -f ~/actions-runner/_diag/*.log`

### Deployment Fails
- Verify Docker is installed and running on server
- Check user has Docker permissions: `docker ps` (should work without sudo)
- Verify GitHub secrets are set correctly
- Check server has enough disk space: `df -h`

### Tests Failing
- MongoDB service might not be starting properly
- Check test logs in GitHub Actions artifacts
- Verify Testcontainers configuration in your tests

### Container Won't Start
- Check Docker logs: `docker logs eventease-backend`
- Verify environment variables in `.env.prod`
- Check port 8080 is not already in use: `sudo lsof -i :8080`

## 📊 Comparison with Your Friend's .NET Pipeline

| Feature | Your Friend (.NET) | Your Pipeline (Java) |
|---------|-------------------|---------------------|
| Build Tool | `dotnet publish` | `./mvnw package` |
| Test Framework | `dotnet test` | `./mvnw test` |
| Database | MongoDB service | MongoDB service |
| Runner | `self-hosted` for deploy | `self-hosted` for deploy |
| Version Source | `.csproj` file | `pom.xml` file |
| Container Port | 8001 | 8080 |
| Image Naming | `flemot-api:version` | `eventease-backend:version` |

## 🎯 Next Steps

1. ✅ Set up self-hosted runner on your server
2. ✅ Add GitHub secrets
3. ✅ Test the pipeline with a commit
4. 📝 Consider adding health check endpoint
5. 📝 Set up monitoring/alerting
6. 📝 Configure custom domain if needed

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Self-hosted Runners Guide](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Docker Documentation](https://docs.docker.com/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
