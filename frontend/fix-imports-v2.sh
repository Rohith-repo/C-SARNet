#!/bin/bash

# Function to fix imports in a file
fix_imports() {
    local file=$1
    
    # Radix UI packages
    sed -i 's/@radix-ui\/react-slot@1.1.2/@radix-ui\/react-slot/g' "$file"
    sed -i 's/@radix-ui\/react-avatar@1.1.3/@radix-ui\/react-avatar/g' "$file"
    sed -i 's/@radix-ui\/react-scroll-area@1.2.3/@radix-ui\/react-scroll-area/g' "$file"
    sed -i 's/@radix-ui\/react-label@2.1.2/@radix-ui\/react-label/g' "$file"
    sed -i 's/@radix-ui\/react-tabs@1.1.3/@radix-ui\/react-tabs/g' "$file"
    sed -i 's/@radix-ui\/react-separator@1.1.2/@radix-ui\/react-separator/g' "$file"
    sed -i 's/@radix-ui\/react-progress@1.1.2/@radix-ui\/react-progress/g' "$file"
    sed -i 's/@radix-ui\/react-collapsible@1.1.3/@radix-ui\/react-collapsible/g' "$file"
    sed -i 's/@radix-ui\/react-alert-dialog@1.1.6/@radix-ui\/react-alert-dialog/g' "$file"
    
    # Other packages
    sed -i 's/class-variance-authority@0.7.1/class-variance-authority/g' "$file"
    sed -i 's/sonner@2.0.3/sonner/g' "$file"
    sed -i 's/next-themes@0.4.6/next-themes/g' "$file"
}

# Process all TypeScript/React files
find src -type f \( -name "*.tsx" -o -name "*.ts" \) | while read -r file; do
    echo "Processing $file..."
    fix_imports "$file"
done