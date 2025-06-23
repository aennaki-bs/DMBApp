#!/bin/bash
# generate-all-pages.sh
# Generates all page architectures based on the vendor management template

echo "🚀 Starting automated page architecture generation..."
echo "📊 This will create modular architectures for all management pages"

# Page configurations: "PageName entityName IconName ServiceName"
declare -a pages=(
    "Customer customer Users customerService"
    "DocumentType documentType Layers documentService"
    "User user User adminService"
    "ApprovalGroup approvalGroup Users approvalService"
    "Circuit circuit GitBranch circuitService"
    "ResponsibilityCentre responsibilityCentre Building responsibilityCentreService"
    "Approver approver UserCheck approverService"
    "GeneralAccount generalAccount CreditCard generalAccountService"
    "Item item Package itemService"
    "UnitCode unitCode Ruler unitCodeService"
    "DocumentLigne documentLigne FileText documentLigneService"
    "Location location MapPin locationService"
    "SubType subType Tag subTypeService"
    "CircuitStep circuitStep List circuitStepService"
    "CircuitStatus circuitStatus CheckCircle circuitStatusService"
    "CircuitTransition circuitTransition ArrowRight circuitTransitionService"
    "StepStatus stepStatus Circle stepStatusService"
)

# Generate each page architecture
for page_config in "${pages[@]}"; do
    IFS=' ' read -r page_name entity_name icon_name service_name <<< "$page_config"
    
    echo ""
    echo "🏗️  Generating $page_name management..."
    
    # Run the individual generator script
    chmod +x generate-page-architecture.sh
    ./generate-page-architecture.sh "$page_name" "$entity_name" "$icon_name"
    
    if [ $? -eq 0 ]; then
        echo "✅ $page_name management created successfully"
    else
        echo "❌ Failed to create $page_name management"
    fi
done

echo ""
echo "🎉 Batch generation completed!"
echo ""
echo "📋 Summary:"
echo "   - Generated ${#pages[@]} page architectures"
echo "   - Each page includes:"
echo "     • Main page component with header"
echo "     • Content component with business logic"
echo "     • Search bar with advanced filtering"
echo "     • Table with sorting and selection"
echo "     • Pagination controls"
echo "     • Edit/Delete dialogs"
echo "     • Bulk actions"
echo "     • Custom hooks for state management"
echo ""
echo "📝 Next steps for each page:"
echo "   1. Customize service imports and API endpoints"
echo "   2. Update data models and interfaces"
echo "   3. Customize search fields and business logic"
echo "   4. Update form fields and validation"
echo "   5. Test CRUD operations"
echo "   6. Update page imports in /pages/ directory"
echo ""
echo "🎯 All pages now have consistent, professional architecture!" 