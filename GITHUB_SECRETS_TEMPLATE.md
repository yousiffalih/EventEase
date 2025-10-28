# GitHub Secrets Configuration

## 🔐 Required Secrets

Add these secrets to your GitHub repository at:
**https://github.com/yousiffalih/EventEase/settings/secrets/actions**

---

### 1. MONGODB_URI
**Description**: MongoDB connection string for production

**Format**:
```
mongodb://username:password@host:port/database
```

**Example**:
```
mongodb://admin:mypassword@localhost:27017/eventease_prod
```

**Or for MongoDB Atlas**:
```
mongodb+srv://username:password@cluster.mongodb.net/eventease_prod
```

---

### 2. MONGODB_DATABASE
**Description**: Name of the MongoDB database

**Example**:
```
eventease_prod
```

---

### 3. JWT_SECRET
**Description**: Secret key for JWT token generation and validation

**Requirements**:
- Should be a long, random string
- At least 256 bits (32 characters) recommended
- Keep it secret and never commit to code

**Example** (generate a random one):
```
your-super-secret-jwt-key-that-should-be-very-long-and-random-123456789
```

**Generate a secure secret**:
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use online generator
# https://randomkeygen.com/
```

---

## 📝 How to Add Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the **Name** (e.g., `MONGODB_URI`)
5. Enter the **Value** (e.g., your actual MongoDB connection string)
6. Click **Add secret**
7. Repeat for all three secrets

---

## ✅ Verification Checklist

- [ ] `MONGODB_URI` added with correct connection string
- [ ] `MONGODB_DATABASE` added with database name
- [ ] `JWT_SECRET` added with secure random string
- [ ] All secrets are visible in Settings → Secrets → Actions
- [ ] No secrets are committed to your code repository

---

## 🔒 Security Best Practices

1. **Never commit secrets to code**
   - Don't put them in `.env` files that are tracked by git
   - Add `.env*` to `.gitignore`

2. **Use different secrets for different environments**
   - Development: Use local/test values
   - Production: Use secure production values

3. **Rotate secrets regularly**
   - Change JWT_SECRET periodically
   - Update MongoDB passwords regularly

4. **Limit access**
   - Only give repository access to trusted team members
   - Use GitHub's environment protection rules for production

---

## 🧪 Testing Secrets

After adding secrets, test them by:

1. Triggering the CI/CD pipeline (push to main/develop)
2. Check the deployment job logs
3. Verify the container starts successfully
4. Test your API endpoints

If deployment fails, check:
- Secrets are spelled correctly (case-sensitive)
- Connection strings are valid
- MongoDB is accessible from your server
- JWT_SECRET is properly formatted

---

## 📋 Example .env.prod (Created by Pipeline)

The pipeline will automatically create this file on your server:

```bash
SPRING_DATA_MONGODB_URI=mongodb://...
SPRING_DATA_MONGODB_DATABASE=eventease_prod
JWT_SECRET=your-secret-key
SERVER_PORT=8080
```

This file is **NOT** committed to git - it's created dynamically from GitHub secrets.
