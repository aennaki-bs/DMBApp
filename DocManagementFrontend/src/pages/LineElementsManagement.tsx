import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Hash, Calculator, Plus, Search, Filter, TrendingUp, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

// Import the management components we'll create
import ItemsManagement from '@/components/line-elements/ItemsManagement';
import UniteCodesManagement from '@/components/line-elements/UniteCodesManagement';
import GeneralAccountsManagement from '@/components/line-elements/GeneralAccountsManagement';

// Import services
import lineElementsService from '@/services/lineElementsService';
import { LignesElementType } from '@/models/lineElements';

const LineElementsManagement = () => {
  const [activeTab, setActiveTab] = useState('items');
  const [elementTypes, setElementTypes] = useState<LignesElementType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [counts, setCounts] = useState({
    items: 0,
    uniteCodes: 0,
    generalAccounts: 0
  });

  useEffect(() => {
    const fetchElementTypes = async () => {
      try {
        setIsLoading(true);
        const [types, items, uniteCodes, generalAccounts] = await Promise.all([
          lineElementsService.elementTypes.getAll(),
          lineElementsService.items.getAll(),
          lineElementsService.uniteCodes.getAll(),
          lineElementsService.generalAccounts.getAll()
        ]);
        setElementTypes(types);
        setCounts({
          items: items.length,
          uniteCodes: uniteCodes.length,
          generalAccounts: generalAccounts.length
        });
      } catch (error) {
        console.error('Failed to fetch element types:', error);
        toast.error('Failed to load element types');
      } finally {
        setIsLoading(false);
      }
    };

    fetchElementTypes();
  }, []);

  const getElementTypeInfo = (tableName: string) => {
    return elementTypes.find(et => et.tableName.toLowerCase() === tableName.toLowerCase());
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-blue-300 font-medium">Loading line elements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="bg-[#0a1033] border border-blue-900/30 rounded-lg p-6 mb-6 transition-all">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-white flex items-center">
              <Database className="mr-3 h-6 w-6 text-blue-400" />
              Line Elements Management
            </h1>
            <p className="text-sm md:text-base text-blue-300">
              Manage items, unit codes, and general accounts used in document lines
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
              <Input
                placeholder="Search across all elements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#0f1642] border-blue-900/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-300">Items</CardTitle>
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Package className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">
              {isLoading ? '-' : counts.items.toLocaleString()}
            </div>
            <p className="text-xs text-blue-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Physical items and products
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1642] border-blue-900/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-300">Unit Codes</CardTitle>
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Hash className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">
              {isLoading ? '-' : counts.uniteCodes.toLocaleString()}
            </div>
            <p className="text-xs text-blue-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Measurement units
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#0f1642] border-blue-900/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-semibold text-blue-300">General Accounts</CardTitle>
            <div className="p-2 bg-blue-900/30 rounded-lg">
              <Calculator className="h-4 w-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">
              {isLoading ? '-' : counts.generalAccounts.toLocaleString()}
            </div>
            <p className="text-xs text-blue-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              Accounting codes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-[#0a1033] border-blue-900/30 shadow-lg">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="border-b border-blue-900/30 pb-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="text-xl font-semibold text-white">Element Management</CardTitle>
                <CardDescription className="text-blue-300 mt-1">
                  Create, edit, and manage line elements across different categories
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {elementTypes.map((type) => (
                  <Badge key={type.id} variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-900/20">
                    {type.typeElement}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-3 bg-[#111633] p-1 rounded-lg border border-blue-900/30 h-12">
              <TabsTrigger 
                value="items" 
                className="flex items-center justify-center space-x-2 data-[state=active]:bg-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-blue-300 hover:text-blue-200 hover:bg-blue-900/30 h-10 rounded-md"
              >
                <Package className="h-4 w-4" />
                <span className="font-medium">Items</span>
                <Badge variant="secondary" className="ml-1 text-xs bg-emerald-900/30 text-emerald-300 border-emerald-500/30">
                  {counts.items}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="unitecodes" 
                className="flex items-center justify-center space-x-2 data-[state=active]:bg-amber-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-blue-300 hover:text-blue-200 hover:bg-blue-900/30 h-10 rounded-md"
              >
                <Hash className="h-4 w-4" />
                <span className="font-medium">Unit Codes</span>
                <Badge variant="secondary" className="ml-1 text-xs bg-amber-900/30 text-amber-300 border-amber-500/30">
                  {counts.uniteCodes}
                </Badge>
              </TabsTrigger>
              <TabsTrigger 
                value="generalaccounts" 
                className="flex items-center justify-center space-x-2 data-[state=active]:bg-violet-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-200 text-blue-300 hover:text-blue-200 hover:bg-blue-900/30 h-10 rounded-md"
              >
                <Calculator className="h-4 w-4" />
                <span className="font-medium">General Accounts</span>
                <Badge variant="secondary" className="ml-1 text-xs bg-violet-900/30 text-violet-300 border-violet-500/30">
                  {counts.generalAccounts}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="p-6">
              <TabsContent value="items" className="mt-0">
                <ItemsManagement 
                  searchTerm={searchTerm}
                  elementType={getElementTypeInfo('Item')}
                />
              </TabsContent>

              <TabsContent value="unitecodes" className="mt-0">
                <UniteCodesManagement 
                  searchTerm={searchTerm}
                  elementType={getElementTypeInfo('UniteCode')}
                />
              </TabsContent>

              <TabsContent value="generalaccounts" className="mt-0">
                <GeneralAccountsManagement 
                  searchTerm={searchTerm}
                  elementType={getElementTypeInfo('GeneralAccounts')}
                />
              </TabsContent>
            </div>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default LineElementsManagement; 