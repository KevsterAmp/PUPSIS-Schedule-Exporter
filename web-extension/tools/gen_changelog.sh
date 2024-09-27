#!/bin/bash

# Navigate to the root directory where CHANGELOG.md will be created
cd "$(dirname "$0")/../.." || exit 1

# Get the most recent tag (e.g., 4.0.1)
LAST_TAG=$(git describe --tags --abbrev=0)

# Get the logs after the last tag
LOGS=$(git log ${LAST_TAG}..HEAD --pretty=format:"- %s")

# Get the next version number 
VERSION = $(cat /dist/version)

# Write to CHANGELOG.md
echo "" >> CHANGELOG.md
echo "$LOGS" >> CHANGELOG.md

# Append previous changelog
if [ -f CHANGELOG.md ]; then
  cat CHANGELOG.md >> CHANGELOG.md.tmp
  mv CHANGELOG.md.tmp CHANGELOG.md
fi

echo "CHANGELOG.md has been updated."
