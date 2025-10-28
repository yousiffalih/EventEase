# EventEase CI/CD Pipeline - Complete Summary

## 🎯 Overview

Modern CI/CD pipeline for EventEase following industry best practices:
- ✅ Automated Build & Test
- ✅ Integration tests with MongoDB
- ✅ Self-hosted deployment with version control
- ✅ Docker containerization

---

## 📋 Pipeline Structure (3 Stages)

### Stage 1: BUILD 🏗️
- **Runner**: `ubuntu-latest` (GitHub-hosted)
- **Purpose**: Compile the application
- **Actions**:
  - Checkout code
  - Setup Java 17 + Maven with cache
  - Build: `./mvnw clean package -DskipTests`
  - Upload JAR artifact

### Stage 2: TEST 🧪
- **Runner**: `ubuntu-latest` (GitHub-hosted)
- **Purpose**: Run integration tests
- **Services**: MongoDB 8.0 container
- **Actions**:
  - Download build artifact
  - Run tests: `./mvnw test`
  - Upload test results (retained 30 days)

### Stage 3: DEPLOY 🚀
- **Runner**: `self-hosted` (YOUR server)
- **Condition**: Only on `main` or `develop` branches
- **Actions**:
  - Create `.env.prod` from GitHub secrets
  - Extract version from `pom.xml`
  - Stop old container
  - Build new Docker image with version tag
  - Start new container on port 8080
  - Clean up old images

---

## 🔧 Setup Requirements

### 1. Self-Hosted Runner Setup

**On your server in the salle:**

```bash
# Create runner directory
mkdir -p ~/actions-runner && cd ~/actions-runner

# Download runner (get fresh token from GitHub first!)
curl -o actions-runner-linux-x64-2.329.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.329.0/actions-runner-linux-x64-2.329.0.tar.gz

# Validate
echo "194f1e1e4bd02f80b7e9633fc546084d8d4e19f3928a324d512ea53430102e1d  actions-runner-linux-x64-2.329.0.tar.gz" | shasum -a 256 -c

# Extract
tar xzf ./actions-runner-linux-x64-2.329.0.tar.gz

# Configure (get token from: https://github.com/yousiffalih/EventEase/settings/actions/runners/new)
./config.sh --url https://github.com/yousiffalih/EventEase --token YOUR_TOKEN

# Install as service
sudo ./svc.sh install
sudo ./svc.sh start
```

### 2. GitHub Secrets Configuration

Add these at: `Settings → Secrets and variables → Actions`

| Secret | Description | Example |
|--------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://user:pass@host:27017/eventease` |
| `MONGODB_DATABASE` | Database name | `eventease_prod` |
| `JWT_SECRET` | JWT secret key | `your-super-secret-jwt-key-here` |

**Generate secure JWT secret:**
```bash
openssl rand -base64 32
```

### 3. Server Prerequisites

```bash
# Install Docker
sudo apt update
sudo apt install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in for this to take effect

# Verify
docker --version
docker ps
```

---

## 🐳 Docker Configuration

### Dockerfile (Multi-stage Build)
```dockerfile
# Build stage
FROM maven:latest AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package

# Runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
```

### Version-Based Tagging
The pipeline reads version from `pom.xml`:
```xml
<version>0.0.1-SNAPSHOT</version>
```

Creates images:
- `eventease-backend:0.0.1-SNAPSHOT`
- `eventease-backend:latest`

---

## 🚀 Deployment Process

### Automatic Deployment Flow
1. **Extract version** from `pom.xml`
2. **Stop old container** (if exists)
3. **Build new image** with version tag
4. **Start new container** with environment variables
5. **Verify** container is running
6. **Clean up** old images

### Container Configuration
- **Name**: `eventease-backend`
- **Port**: `8080:8080`
- **Environment**: From `.env.prod` (created from secrets)
- **Restart**: Automatic on failure

---

## 📊 Testing Strategy

### Integration Tests
- **Framework**: JUnit 5 + Spring Boot Test
- **Database**: MongoDB 8.0 (GitHub Actions service)
- **Isolation**: Clean database for each test run

### Test Execution
```bash
# Local
./mvnw test

# Specific test
./mvnw test -Dtest=AdminReservationIntegrationTest

# With coverage
./mvnw test jacoco:report
```

---

## 🔄 Development Workflow

### 1. Local Development
```bash
# Build
./mvnw clean package

# Run tests
./mvnw test

# Run locally
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### 2. Push to GitHub
```bash
git add .
git commit -m "feat: add new feature"
git push origin develop
```

### 3. Automatic Pipeline
- ✅ **Build** runs on all branches
- ✅ **Test** runs after successful build
- ✅ **Deploy** runs only on `main` or `develop` (self-hosted runner)

---

## 🎯 Branch Strategy

| Branch | Build | Test | Deploy |
|--------|-------|------|--------|
| `main` | ✅ | ✅ | ✅ |
| `develop` | ✅ | ✅ | ✅ |
| Feature branches | ✅ | ✅ | ❌ |
| Pull Requests | ✅ | ✅ | ❌ |

---

## 🔍 Monitoring & Debugging

### View Logs
```bash
# Container logs
docker logs eventease-backend
docker logs -f eventease-backend  # Follow

# Runner logs (on server)
tail -f ~/actions-runner/_diag/*.log

# Check container status
docker ps
docker inspect eventease-backend
```

### Common Commands
```bash
# Restart container
docker restart eventease-backend

# Stop container
docker stop eventease-backend

# Remove container
docker rm eventease-backend

# View images
docker images | grep eventease

# Clean up
docker image prune -f
docker container prune -f
```

---

## 🚨 Troubleshooting

### Runner Issues
- **Not appearing**: Check token hasn't expired, verify service status
- **Offline**: Restart service: `sudo ./svc.sh restart`
- **Logs**: Check `~/actions-runner/_diag/*.log`

### Build Failures
- Verify Java 17 is used
- Check Maven dependencies
- Review GitHub Actions logs

### Test Failures
- Check MongoDB service is starting
- Review test logs in artifacts
- Verify Testcontainers configuration

### Deployment Issues
- Verify Docker is installed and running
- Check user has Docker permissions (no sudo needed)
- Verify GitHub secrets are set correctly
- Check port 8080 is available
- Review container logs

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `.github/workflows/ci-cd.yml` | Pipeline configuration |
| `EventEase/backend/Dockerfile` | Docker image definition |
| `EventEase/backend/pom.xml` | Maven configuration & version |
| `CICD_SETUP_GUIDE.md` | Detailed setup instructions |
| `GITHUB_SECRETS_TEMPLATE.md` | Secrets configuration guide |

---

## ✅ Pre-Deployment Checklist

- [ ] Self-hosted runner installed and running on server
- [ ] GitHub secrets configured (MONGODB_URI, MONGODB_DATABASE, JWT_SECRET)
- [ ] Docker installed on server
- [ ] User added to docker group
- [ ] Port 8080 available on server
- [ ] Tests passing locally
- [ ] Version updated in pom.xml (if needed)

---

## 🎓 Comparison with .NET Pipeline

Your pipeline follows the same pattern as your friend's:

| Aspect | Friend (.NET) | You (Java) |
|--------|--------------|------------|
| **Build** | `dotnet publish` | `./mvnw package` |
| **Test** | `dotnet test` | `./mvnw test` |
| **Database** | MongoDB service | MongoDB service |
| **Deploy Runner** | `self-hosted` | `self-hosted` |
| **Version Source** | `.csproj` | `pom.xml` |
| **Port** | 8001 | 8080 |
| **Container Name** | `flemot-api` | `eventease-backend` |

---

## 📞 Next Steps

1. ✅ Set up self-hosted runner on your server
2. ✅ Configure GitHub secrets
3. ✅ Test with a commit to `develop`
4. ✅ Verify deployment on your server
5. 📝 Monitor logs and performance
6. 📝 Set up custom domain (optional)

---

**Last Updated**: 2025-10-28  
**Pipeline Version**: 2.0.0  
**Status**: ✅ Production Ready
