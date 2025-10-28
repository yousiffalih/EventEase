# 🧪 CI/CD Pipeline Testing Guide

## Testing Strategy

Test your pipeline in stages to catch issues early:

1. **Local Docker Test** - Test deployment script locally
2. **Manual GitHub Actions Test** - Trigger pipeline manually
3. **Automatic Test** - Push to develop branch
4. **Production Test** - Push to main branch

---

## 1️⃣ Local Docker Test (Do This First!)

### On Your Local Machine

Test that Docker build works:

```bash
cd ~/Bureau/EventEase/EventEase/backend

# Build the Docker image
docker build -t eventease-backend:test .

# Check image was created
docker images | grep eventease-backend

# Test run locally
docker run -d \
  --name eventease-test \
  -p 8080:8080 \
  -e SPRING_DATA_MONGODB_URI=mongodb://host.docker.internal:27017/eventease \
  -e SPRING_DATA_MONGODB_DATABASE=eventease_test \
  -e JWT_SECRET=test-secret \
  eventease-backend:test

# Wait a few seconds
sleep 10

# Check logs
docker logs eventease-test

# Test the API (if you have a health endpoint)
curl http://localhost:8080/actuator/health

# Clean up
docker stop eventease-test
docker rm eventease-test
```

**Expected Result**: Container starts successfully, no errors in logs.

---

## 2️⃣ Test on Your Server

### Copy test script to your server:

```bash
# From your local machine
scp test-deployment.sh your-user@your-server-ip:~/
```

### SSH to your server and run:

```bash
ssh your-user@your-server-ip

# Make executable
chmod +x ~/test-deployment.sh

# Run the test
./test-deployment.sh
```

**Expected Result**:
- ✅ Docker image builds successfully
- ✅ Container starts on port 8080
- ✅ No errors in logs
- ✅ Application responds to requests

### Verify it's working:

```bash
# Check container is running
docker ps | grep eventease-backend

# Check logs
docker logs eventease-backend

# Test API (adjust endpoint as needed)
curl http://localhost:8080/actuator/health
# or
curl http://localhost:8080/api/health
```

---

## 3️⃣ Test GitHub Actions Pipeline

### Step 1: Set Up Self-Hosted Runner

**On your server:**

```bash
# Get fresh token from:
# https://github.com/yousiffalih/EventEase/settings/actions/runners/new

mkdir -p ~/actions-runner && cd ~/actions-runner
curl -o actions-runner-linux-x64-2.329.0.tar.gz -L \
  https://github.com/actions/runner/releases/download/v2.329.0/actions-runner-linux-x64-2.329.0.tar.gz
echo "194f1e1e4bd02f80b7e9633fc546084d8d4e19f3928a324d512ea53430102e1d  actions-runner-linux-x64-2.329.0.tar.gz" | shasum -a 256 -c
tar xzf ./actions-runner-linux-x64-2.329.0.tar.gz
./config.sh --url https://github.com/yousiffalih/EventEase --token YOUR_TOKEN
sudo ./svc.sh install
sudo ./svc.sh start
```

**Verify runner is online:**
- Go to: https://github.com/yousiffalih/EventEase/settings/actions/runners
- Should see green "Idle" status

### Step 2: Configure GitHub Secrets

Go to: https://github.com/yousiffalih/EventEase/settings/secrets/actions

Add these secrets:

```bash
# Generate JWT secret
openssl rand -base64 32
```

| Secret Name | Example Value |
|-------------|---------------|
| `MONGODB_URI` | `mongodb://localhost:27017/eventease_prod` |
| `MONGODB_DATABASE` | `eventease_prod` |
| `JWT_SECRET` | (output from openssl command above) |

### Step 3: Test with Manual Trigger

1. Go to: https://github.com/yousiffalih/EventEase/actions
2. Click on "EventEase Backend CI/CD" workflow
3. Click "Run workflow" dropdown
4. Select `develop` branch
5. Click "Run workflow"

**Watch the pipeline:**
- ✅ Build job should complete (~2-3 minutes)
- ✅ Test job should complete (~3-5 minutes)
- ✅ Deploy job should complete (~5-10 minutes)

---

## 4️⃣ Test with Real Commit

### Test on Develop Branch First

```bash
# Create a test branch
git checkout develop
git pull origin develop

# Make a small change
echo "# CI/CD Test" >> README.md

# Commit and push
git add README.md
git commit -m "test: trigger CI/CD pipeline"
git push origin develop
```

**Monitor the pipeline:**
1. Go to: https://github.com/yousiffalih/EventEase/actions
2. Click on the running workflow
3. Watch each job complete

**Expected Timeline:**
- **Build**: 2-3 minutes
- **Test**: 3-5 minutes (includes MongoDB startup)
- **Deploy**: 5-10 minutes (includes Docker build)

### Check Deployment on Server

**SSH to your server:**

```bash
# Check container is running
docker ps

# Should see:
# CONTAINER ID   IMAGE                              STATUS
# xxxxx          eventease-backend:0.0.1-SNAPSHOT   Up X minutes

# Check logs
docker logs eventease-backend

# Test the API
curl http://localhost:8080/actuator/health
```

---

## 5️⃣ Test Production Deployment

Once develop works, test on main:

```bash
# Merge to main
git checkout main
git pull origin main
git merge develop
git push origin main
```

**Same monitoring process as step 4.**

---

## 🔍 What to Check at Each Stage

### During Build Job
- ✅ Maven downloads dependencies
- ✅ Compilation succeeds
- ✅ JAR artifact is created
- ✅ Artifact is uploaded

### During Test Job
- ✅ MongoDB service starts
- ✅ Tests run successfully
- ✅ Test results are uploaded
- ✅ No test failures

### During Deploy Job
- ✅ Runner picks up the job (self-hosted)
- ✅ Environment file is created
- ✅ Version is extracted from pom.xml
- ✅ Docker image builds successfully
- ✅ Old container stops
- ✅ New container starts
- ✅ Container is running

---

## 🚨 Troubleshooting

### Build Job Fails

**Check:**
```bash
# Locally test Maven build
cd EventEase/backend
./mvnw clean package
```

**Common issues:**
- Compilation errors in code
- Missing dependencies
- Wrong Java version

### Test Job Fails

**Check GitHub Actions logs for:**
- MongoDB service startup issues
- Test failures
- Connection problems

**Test locally:**
```bash
# Run tests locally
./mvnw test
```

### Deploy Job Fails

**Issue: Runner not picking up job**
```bash
# On server, check runner status
cd ~/actions-runner
sudo ./svc.sh status

# Check logs
tail -f ~/actions-runner/_diag/*.log
```

**Issue: Docker build fails**
```bash
# On server, test Docker build manually
cd ~/EventEase/EventEase/backend
docker build -t test .
```

**Issue: Container won't start**
```bash
# Check Docker logs
docker logs eventease-backend

# Check if port is in use
sudo lsof -i :8080

# Check environment variables
docker inspect eventease-backend | grep -A 20 Env
```

**Issue: Secrets not working**
- Verify secrets are set in GitHub: Settings → Secrets → Actions
- Check secret names match exactly (case-sensitive)
- Re-add secrets if needed

---

## 📊 Success Indicators

### ✅ Pipeline Successful When:

1. **All jobs complete** with green checkmarks
2. **Container is running** on server: `docker ps | grep eventease-backend`
3. **Application responds** to requests
4. **Logs show no errors**: `docker logs eventease-backend`
5. **Correct version deployed**: Check image tag matches pom.xml version

### 🧪 Test Your Deployed Application

```bash
# Health check (if you have actuator)
curl http://your-server-ip:8080/actuator/health

# Or test your actual API endpoints
curl http://your-server-ip:8080/api/your-endpoint

# Check application info
curl http://your-server-ip:8080/actuator/info
```

---

## 📝 Testing Checklist

Use this checklist for your first deployment:

- [ ] Local Docker build works
- [ ] Test script works on server
- [ ] Self-hosted runner installed and online
- [ ] GitHub secrets configured
- [ ] Docker installed on server
- [ ] User has Docker permissions (no sudo needed)
- [ ] Port 8080 is available
- [ ] Manual workflow trigger works
- [ ] Develop branch deployment works
- [ ] Container starts successfully
- [ ] Application responds to requests
- [ ] Logs show no errors
- [ ] Main branch deployment works

---

## 🎯 Quick Test Commands

### On Your Server

```bash
# Check everything is running
docker ps
sudo ./svc.sh status

# View logs
docker logs -f eventease-backend
tail -f ~/actions-runner/_diag/*.log

# Restart if needed
docker restart eventease-backend
sudo ./svc.sh restart

# Clean up for fresh test
docker stop eventease-backend
docker rm eventease-backend
docker image prune -f
```

### From Your Local Machine

```bash
# Test API from local machine
curl http://your-server-ip:8080/actuator/health

# Watch GitHub Actions
# https://github.com/yousiffalih/EventEase/actions

# Trigger deployment
git commit --allow-empty -m "test: trigger deployment"
git push origin develop
```

---

## 📚 Next Steps After Successful Test

1. ✅ Document your server IP and credentials
2. ✅ Set up monitoring/alerting
3. ✅ Configure domain name (optional)
4. ✅ Set up HTTPS/SSL (optional)
5. ✅ Create backup strategy
6. ✅ Document rollback procedure

---

## 🆘 Need Help?

If something doesn't work:

1. **Check GitHub Actions logs** - Most detailed error info
2. **Check runner logs** - `~/actions-runner/_diag/*.log`
3. **Check container logs** - `docker logs eventease-backend`
4. **Review the guides**:
   - `QUICK_START.md` - Basic setup
   - `CICD_SETUP_GUIDE.md` - Detailed setup
   - `CICD_SUMMARY.md` - Complete reference

---

**Ready to test? Start with Step 1! 🚀**
