#!/bin/bash

# This script pushes only the backend-related files to a dedicated branch.

# --- Configuration ---
# The name of the branch you want to push the backend code to.
# This branch can be created on GitHub beforehand or will be created by this script.
BACKEND_BRANCH="backend-deploy"

# A temporary directory for staging the backend files.
TEMP_DIR="_backend_temp"

# --- Script Logic ---

# Exit immediately if a command exits with a non-zero status.
set -e

echo ">>> Preparing backend-only deployment for branch: $BACKEND_BRANCH"

# 1. Clean up any previous temporary directory.
rm -rf $TEMP_DIR
mkdir $TEMP_DIR

# 2. Copy only the necessary backend files and config to the temp directory.
echo "--> Copying necessary files..."
cp -r api $TEMP_DIR/      # The Vercel API directory
cp package.json $TEMP_DIR/
cp package-lock.json $TEMP_DIR/
# Add any other root-level config files your backend needs, e.g., .env.example
# cp .env.example $TEMP_DIR/

# 3. Navigate into the temporary directory to perform git operations.
cd $TEMP_DIR

# 4. Initialize a new git repository here.
echo "--> Initializing temporary git repository..."
git init
git add .
git commit -m "Deploy: Backend-only snapshot"

# 5. Add your actual remote repository URL.
#    Replace the URL with your own repository's URL.
GIT_REMOTE_URL="https://github.com/SanskarSontakke/reactiquiz.git"
git remote add origin $GIT_REMOTE_URL

# 6. Force push the contents of this directory to the specified backend branch.
#    The '--force' flag is used because this temporary history is completely separate
#    from your main branch history. It overwrites the backend branch every time.
echo "--> Force pushing to $BACKEND_BRANCH..."
git push origin master:$BACKEND_BRANCH --force

# 7. Clean up by returning to the original directory and deleting the temp folder.
echo "--> Cleaning up..."
cd ..
rm -rf $TEMP_DIR

echo ">>> Successfully deployed backend code to branch: $BACKEND_BRANCH"
echo ">>> You can now deploy this branch on Vercel."