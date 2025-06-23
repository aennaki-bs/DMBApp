#!/bin/bash
# generate-page-architecture.sh
# Usage: ./generate-page-architecture.sh PageName entityName IconName
# Example: ./generate-page-architecture.sh Customer customer Users

PAGE_NAME=$1
ENTITY_NAME=$2
ICON_NAME=$3

if [ -z "$PAGE_NAME" ] || [ -z "$ENTITY_NAME" ] || [ -z "$ICON_NAME" ]; then
    echo "Usage: ./generate-page-architecture.sh PageName entityName IconName"
    echo "Example: ./generate-page-architecture.sh Customer customer Users"
    exit 1
fi

COMPONENT_DIR="DocManagementFrontend/src/components/pages/${ENTITY_NAME}-management"

echo "🏗️  Generating ${PAGE_NAME} Management architecture..."

# Create directory structure
mkdir -p "${COMPONENT_DIR}/components"
mkdir -p "${COMPONENT_DIR}/hooks"

# Copy vendor management as template
cp -r DocManagementFrontend/src/components/pages/vendor-management/* "${COMPONENT_DIR}/"

# Rename files
cd "${COMPONENT_DIR}"
mv VendorManagementPage.tsx ${PAGE_NAME}ManagementPage.tsx
mv VendorManagementContent.tsx ${PAGE_NAME}ManagementContent.tsx

cd components
for file in Vendor*.tsx; do
    new_file=$(echo "$file" | sed "s/Vendor/${PAGE_NAME}/")
    mv "$file" "$new_file"
done

cd ../hooks
for file in useVendor*.ts; do
    new_file=$(echo "$file" | sed "s/Vendor/${PAGE_NAME}/")
    mv "$file" "$new_file"
done

# Mass replace content
cd ..
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/Vendor/${PAGE_NAME}/g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/vendor/${ENTITY_NAME}/g" {} \;
find . -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i "s/Truck/${ICON_NAME}/g" {} \;

echo "✅ Generated ${PAGE_NAME} Management architecture"
echo "📁 Location: ${COMPONENT_DIR}"
echo "📝 Next steps:"
echo "   1. Customize service imports (${ENTITY_NAME}Service)"
echo "   2. Update model imports (${PAGE_NAME})"
echo "   3. Customize search fields and business logic"
echo "   4. Update page import in /pages/ directory" 