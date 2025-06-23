#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Page configurations for automated generation
const pageConfigs = [
  {
    name: 'Customer',
    entity: 'customer',
    icon: 'Users',
    service: 'customerService',
    model: 'Customer',
    updateModel: 'UpdateCustomerRequest',
    description: 'Manage customer information and relationships',
    searchFields: ['code', 'name', 'city', 'country', 'address'],
    sortDefault: 'code',
    pageSize: 25
  },
  {
    name: 'DocumentType',
    entity: 'documentType',
    icon: 'Layers',
    service: 'documentService',
    model: 'DocumentType',
    updateModel: 'UpdateDocumentTypeRequest',
    description: 'Manage document types and their configurations',
    searchFields: ['typeName', 'typeKey', 'typeAttr'],
    sortDefault: 'typeName',
    pageSize: 15
  },
  {
    name: 'User',
    entity: 'user',
    icon: 'User',
    service: 'adminService',
    model: 'User',
    updateModel: 'UpdateUserRequest',
    description: 'Manage system users and permissions',
    searchFields: ['email', 'firstName', 'lastName', 'role'],
    sortDefault: 'email',
    pageSize: 20
  },
  {
    name: 'ApprovalGroup',
    entity: 'approvalGroup',
    icon: 'Users',
    service: 'approvalService',
    model: 'ApprovalGroup',
    updateModel: 'UpdateApprovalGroupRequest',
    description: 'Manage approval groups and workflows',
    searchFields: ['name', 'description'],
    sortDefault: 'name',
    pageSize: 15
  },
  {
    name: 'Circuit',
    entity: 'circuit',
    icon: 'GitBranch',
    service: 'circuitService',
    model: 'Circuit',
    updateModel: 'UpdateCircuitRequest',
    description: 'Manage workflow circuits and processes',
    searchFields: ['name', 'description', 'status'],
    sortDefault: 'name',
    pageSize: 20
  }
];

// Template functions
function createMainPageTemplate(config) {
  return `import { useState } from "react";
import { RefreshCw, ${config.icon} } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import ${config.name}ManagementContent from "./${config.name}ManagementContent";

export default function ${config.name}ManagementPage() {
  const [refetchFunction, setRefetchFunction] = useState<(() => void) | null>(null);

  const handleHeaderRefresh = () => {
    if (refetchFunction) {
      refetchFunction();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-border/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
              <${config.icon} className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                ${config.name} Management
              </h1>
              <p className="text-sm text-muted-foreground">
                ${config.description}
              </p>
            </div>
          </div>

          {refetchFunction && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleHeaderRefresh}
                  className="h-9 px-3 text-sm"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh ${config.entity} data</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 min-h-0">
        <${config.name}ManagementContent onRefetchReady={setRefetchFunction} />
      </div>
    </div>
  );
}`;
}

function createHooksTemplate(config) {
  const filtersHook = `import { useState, useMemo } from "react";
import { ${config.model} } from "@/models/${config.entity}";

export function use${config.name}Filters(${config.entity}s: ${config.model}[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter and search logic
  const filtered${config.name}s = useMemo(() => {
    return ${config.entity}s.filter((${config.entity}) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchIn = {
          all: \`${config.searchFields.map(field => `\${${config.entity}.${field} || ""}`).join(' ')}\`.toLowerCase(),
          ${config.searchFields.map(field => `${field}: (${config.entity}.${field} || "").toLowerCase()`).join(',\n          ')}
        };

        if (!searchIn[searchField as keyof typeof searchIn]?.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [${config.entity}s, searchQuery, searchField]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchField("all");
    setFilterOpen(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    filterOpen,
    setFilterOpen,
    clearAllFilters,
    filtered${config.name}s,
  };
}`;

  const selectionHook = `import { useState, useMemo } from "react";
import { ${config.model} } from "@/models/${config.entity}";

export function use${config.name}Selection() {
  const [selected${config.name}s, setSelected${config.name}s] = useState<string[]>([]);

  const handleSelect${config.name} = (${config.entity}Code: string, checked: boolean) => {
    if (checked) {
      setSelected${config.name}s([...selected${config.name}s, ${config.entity}Code]);
    } else {
      setSelected${config.name}s(selected${config.name}s.filter((code) => code !== ${config.entity}Code));
    }
  };

  const handleSelectAll = (paginated${config.name}s: ${config.model}[]) => {
    const currentPage${config.name}Codes = paginated${config.name}s.map(
      (${config.entity}) => ${config.entity}.${config.searchFields[0]}
    );
    const allCurrentSelected = currentPage${config.name}Codes.every((code) =>
      selected${config.name}s.includes(code)
    );

    if (allCurrentSelected) {
      setSelected${config.name}s(
        selected${config.name}s.filter((code) => !currentPage${config.name}Codes.includes(code))
      );
    } else {
      const newSelected = [...selected${config.name}s];
      currentPage${config.name}Codes.forEach((code) => {
        if (!newSelected.includes(code)) {
          newSelected.push(code);
        }
      });
      setSelected${config.name}s(newSelected);
    }
  };

  const getSelectionState = (paginated${config.name}s: ${config.model}[]) => {
    const isAllSelected =
      paginated${config.name}s.length > 0 &&
      paginated${config.name}s.every((${config.entity}) =>
        selected${config.name}s.includes(${config.entity}.${config.searchFields[0]})
      );
    
    const isIndeterminate =
      selected${config.name}s.length > 0 &&
      !isAllSelected &&
      paginated${config.name}s.some((${config.entity}) =>
        selected${config.name}s.includes(${config.entity}.${config.searchFields[0]})
      );

    return { isAllSelected, isIndeterminate };
  };

  return {
    selected${config.name}s,
    setSelected${config.name}s,
    handleSelect${config.name},
    handleSelectAll,
    getSelectionState,
  };
}`;

  return { filtersHook, selectionHook };
}

function createIndexTemplate(config) {
  return `export { default as ${config.name}ManagementPage } from './${config.name}ManagementPage';
export { default as ${config.name}ManagementContent } from './${config.name}ManagementContent';

// Component exports
export { ${config.name}SearchBar } from './components/${config.name}SearchBar';
export { ${config.name}Table } from './components/${config.name}Table';
export { ${config.name}Pagination } from './components/${config.name}Pagination';
export { ${config.name}EditDialog } from './components/${config.name}EditDialog';
export { ${config.name}BulkActions } from './components/${config.name}BulkActions';
export { ${config.name}DeleteDialog } from './components/${config.name}DeleteDialog';

// Hook exports
export { use${config.name}Filters } from './hooks/use${config.name}Filters';
export { use${config.name}Selection } from './hooks/use${config.name}Selection';`;
}

// Main generation function
async function generatePageArchitecture(config) {
  const basePath = `DocManagementFrontend/src/components/pages/${config.entity}-management`;
  const componentsPath = `\${basePath}/components`;
  const hooksPath = `\${basePath}/hooks`;

  // Create directories
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }
  if (!fs.existsSync(componentsPath)) {
    fs.mkdirSync(componentsPath, { recursive: true });
  }
  if (!fs.existsSync(hooksPath)) {
    fs.mkdirSync(hooksPath, { recursive: true });
  }

  console.log(\`🏗️  Generating \${config.name} Management architecture...\`);

  // Generate main page component
  fs.writeFileSync(
    \`\${basePath}/\${config.name}ManagementPage.tsx\`,
    createMainPageTemplate(config)
  );

  // Generate hooks
  const { filtersHook, selectionHook } = createHooksTemplate(config);
  fs.writeFileSync(
    \`\${hooksPath}/use\${config.name}Filters.ts\`,
    filtersHook
  );
  fs.writeFileSync(
    \`\${hooksPath}/use\${config.name}Selection.ts\`,
    selectionHook
  );

  // Generate index
  fs.writeFileSync(
    \`\${basePath}/index.ts\`,
    createIndexTemplate(config)
  );

  console.log(\`✅ Generated \${config.name} Management architecture\`);
}

// Generate all page architectures
async function generateAllArchitectures() {
  console.log('🚀 Starting automated page architecture generation...');
  console.log(\`📊 Total pages to generate: \${pageConfigs.length}\`);
  
  for (const config of pageConfigs) {
    await generatePageArchitecture(config);
  }
  
  console.log('🎉 All page architectures generated successfully!');
  console.log('📋 Next steps:');
  console.log('  1. Generate remaining component files (SearchBar, Table, etc.)');
  console.log('  2. Create content components with business logic');
  console.log('  3. Update page imports to use new architectures');
  console.log('  4. Test and verify functionality');
}

// Run the generator
if (require.main === module) {
  generateAllArchitectures().catch(console.error);
}

module.exports = { generatePageArchitecture, pageConfigs }; 