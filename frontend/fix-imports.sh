#!/bin/bash

# Navigate to the components directory
cd src/components/ui

# Fix imports in all .tsx files
for file in *.tsx; do
  echo "Fixing imports in $file"
  # Remove version numbers from imports
  sed -i 's/@[0-9]\+\.[0-9]\+\.[0-9]\+//g' "$file"
done