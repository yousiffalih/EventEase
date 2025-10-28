#!/bin/bash

# Test deployment script - Run this on your server to test before using CI/CD

set -e

echo "=================================="
echo "Testing EventEase Deployment"
echo "=================================="

cd ~/EventEase/EventEase/backend

# Create test environment file
echo "Creating test environment file..."
cat > .env.test << EOF
SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/eventease_test
SPRING_DATA_MONGODB_DATABASE=eventease_test
JWT_SECRET=test-secret-key-for-testing-only
SERVER_PORT=8080
EOF

# Extract version from pom.xml
APP_VERSION=$(grep '<version>' pom.xml | head -1 | sed -e 's/.*<version>\(.*\)<\/version>.*/\1/')
IMAGE_NAME="eventease-backend"

echo "Version: $APP_VERSION"
echo "Image: $IMAGE_NAME"

# Stop and remove old container
echo "Stopping old container..."
docker stop $IMAGE_NAME || true
docker rm $IMAGE_NAME || true

# Build Docker image
echo "Building Docker image..."
docker build -t ${IMAGE_NAME}:${APP_VERSION} .
docker tag ${IMAGE_NAME}:${APP_VERSION} ${IMAGE_NAME}:latest

# Start container
echo "Starting container..."
docker run -d \
  --name $IMAGE_NAME \
  -p 8080:8080 \
  --env-file .env.test \
  ${IMAGE_NAME}:${APP_VERSION}

# Wait for startup
echo "Waiting for application to start..."
sleep 10

# Check if container is running
echo "Checking container status..."
docker ps | grep $IMAGE_NAME

# Check logs
echo ""
echo "Container logs:"
docker logs $IMAGE_NAME | tail -20

echo ""
echo "=================================="
echo "✅ Test deployment complete!"
echo "=================================="
echo ""
echo "Test your API:"
echo "  curl http://localhost:8080/actuator/health"
echo ""
echo "View logs:"
echo "  docker logs -f $IMAGE_NAME"
echo ""
echo "Stop container:"
echo "  docker stop $IMAGE_NAME"
echo ""
