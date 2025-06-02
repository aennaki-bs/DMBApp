import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Database, 
  Tag,
  Calendar,
  MoreHorizontal,
  Filter,
  Download,
  Upload,
  SortAsc,
  SortDesc,
  AlertTriangle,
  Loader2,
  Package,
  Calculator
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Import services and types
import lineElementsService from '@/services/lineElementsService';
import { LignesElementType, Item, GeneralAccounts, CreateLignesElementTypeRequest, UpdateLignesElementTypeRequest } from '@/models/lineElements';
import CreateElementTypeWizard from './CreateElementTypeWizard';

// Form validation schema
const elementTypeSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50, 'Code must be 50 characters or less'),
  typeElement: z.string().min(1, 'Type element is required'),
  description: z.string().min(1, 'Description is required').max(255, 'Description must be 255 characters or less'),
  tableName: z.string().min(1, 'Table name is required'),
  itemCode: z.string().optional(),
  accountCode: z.string().optional(),
});

type ElementTypeFormData = z.infer<typeof elementTypeSchema>;

interface LineElementTypeManagementProps {
  searchTerm: string;
}

const LineElementTypeManagement = ({ searchTerm }: LineElementTypeManagementProps) => {
  const [elementTypes, setElementTypes] = useState<LignesElementType[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [generalAccounts, setGeneralAccounts] = useState<GeneralAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof LignesElementType>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedElementTypes, setSelectedElementTypes] = useState<number[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedElementType, setSelectedElementType] = useState<LignesElementType | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [elementTypesInUse, setElementTypesInUse] = useState<Set<number>>(new Set());

  // Form state
  const editForm = useForm<ElementTypeFormData>({
    resolver: zodResolver(elementTypeSchema),
    defaultValues: {
      code: '',
      typeElement: '',
      description: '',
      tableName: '',
      itemCode: '',
      accountCode: '',
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [elementTypesData, itemsData, generalAccountsData] = await Promise.all([
        lineElementsService.elementTypes.getAll(),
        lineElementsService.items.getAll(),
        lineElementsService.generalAccounts.getAll()
      ]);
      setElementTypes(elementTypesData);
      setItems(itemsData);
      setGeneralAccounts(generalAccountsData);

      // Check which element types are in use
      const inUseSet = new Set<number>();
      await Promise.all(
        elementTypesData.map(async (elementType) => {
          try {
            const isInUse = await lineElementsService.elementTypes.isInUse(elementType.id);
            if (isInUse) {
              inUseSet.add(elementType.id);
            }
          } catch (error) {
            console.error(`Failed to check if element type ${elementType.id} is in use:`, error);
          }
        })
      );
      setElementTypesInUse(inUseSet);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load element types data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedElementTypes = useMemo(() => {
    let filtered = elementTypes.filter(elementType => {
      const matchesSearch = 
        elementType.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        elementType.code.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
        elementType.typeElement.toLowerCase().includes(searchTerm.toLowerCase()) ||
        elementType.typeElement.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
        elementType.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        elementType.description.toLowerCase().includes(localSearchTerm.toLowerCase());
      
      const matchesType = selectedTypeFilter === 'all' || 
        elementType.typeElement === selectedTypeFilter;

      return matchesSearch && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'code':
          aValue = a.code;
          bValue = b.code;
          break;
        case 'typeElement':
          aValue = a.typeElement;
          bValue = b.typeElement;
          break;
        case 'description':
          aValue = a.description;
          bValue = b.description;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.code;
          bValue = b.code;
      }

      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [elementTypes, searchTerm, localSearchTerm, selectedTypeFilter, sortField, sortDirection]);

  const handleEditElementType = async (data: ElementTypeFormData) => {
    if (!selectedElementType) return;
    
    try {
      // Clean the data - treat empty strings as undefined
      const cleanItemCode = data.itemCode?.trim() || undefined;
      const cleanAccountCode = data.accountCode?.trim() || undefined;
      
      // Validate that only one foreign key is provided based on typeElement
      if (data.typeElement === 'Item' && !cleanItemCode) {
        toast.error('Item code is required when type element is Item');
        return;
      }
      if (data.typeElement === 'General Accounts' && !cleanAccountCode) {
        toast.error('Account code is required when type element is General Accounts');
        return;
      }
      if (data.typeElement === 'Item' && cleanAccountCode) {
        toast.error('Account code should not be provided when type element is Item');
        return;
      }
      if (data.typeElement === 'General Accounts' && cleanItemCode) {
        toast.error('Item code should not be provided when type element is General Accounts');
        return;
      }

      const updateRequest: UpdateLignesElementTypeRequest = {
        code: data.code.trim(),
        typeElement: data.typeElement,
        description: data.description && data.description.trim() && 
          !data.description.includes('Item element type') && 
          !data.description.includes('General Accounts element type')
          ? data.description.trim() 
          : `${data.typeElement} element type for ${data.tableName}`,
        tableName: data.tableName.trim(),
        itemCode: data.typeElement === 'Item' ? cleanItemCode : undefined,
        accountCode: data.typeElement === 'General Accounts' ? cleanAccountCode : undefined,
      };
      
      await lineElementsService.elementTypes.update(selectedElementType.id, updateRequest);
      toast.success('Element type updated successfully');
      setIsEditDialogOpen(false);
      setSelectedElementType(null);
      editForm.reset();
      fetchData();
    } catch (error) {
      console.error('Failed to update element type:', error);
      toast.error('Failed to update element type');
    }
  };

  const handleDeleteElementType = async () => {
    if (!selectedElementType) return;
    
    try {
      await lineElementsService.elementTypes.delete(selectedElementType.id);
      toast.success('Element type deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedElementType(null);
      fetchData();
    } catch (error) {
      console.error('Failed to delete element type:', error);
      toast.error('Failed to delete element type');
    }
  };

  const handleSort = (field: keyof LignesElementType) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectElementType = (id: number) => {
    setSelectedElementTypes(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleSelectAllElementTypes = () => {
    if (selectedElementTypes.length === filteredAndSortedElementTypes.length) {
      setSelectedElementTypes([]);
    } else {
      setSelectedElementTypes(filteredAndSortedElementTypes.map(et => et.id));
    }
  };

  const openEditDialog = (elementType: LignesElementType) => {
    setSelectedElementType(elementType);
    editForm.reset({
      code: elementType.code,
      typeElement: elementType.typeElement,
      description: elementType.description,
      tableName: elementType.tableName,
      itemCode: elementType.itemCode || '',
      accountCode: elementType.accountCode || '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (elementType: LignesElementType) => {
    setSelectedElementType(elementType);
    setIsDeleteDialogOpen(true);
  };

  const getTypeIcon = (typeElement: string) => {
    switch (typeElement) {
      case 'Item':
        return <Package className="h-4 w-4" />;
      case 'General Accounts':
        return <Calculator className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (typeElement: string) => {
    switch (typeElement) {
      case 'Item':
        return 'bg-emerald-900/30 text-emerald-300 border-emerald-500/30';
      case 'General Accounts':
        return 'bg-violet-900/30 text-violet-300 border-violet-500/30';
      default:
        return 'bg-blue-900/30 text-blue-300 border-blue-500/30';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
          <p className="text-blue-300 font-medium">Loading element types...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Database className="mr-2 h-5 w-5 text-blue-400" />
            Element Type Management
          </h2>
          <p className="text-sm text-blue-300 mt-1">
            Manage line element types and their associations
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Element Type
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
            <Input
              placeholder="Search element types..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400"
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedTypeFilter} onValueChange={setSelectedTypeFilter}>
            <SelectTrigger className="w-48 bg-[#111633] border-blue-900/50 text-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent className="bg-[#111633] border-blue-900/50">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Item">Items</SelectItem>
              <SelectItem value="General Accounts">General Accounts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0f1642] border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Total Types</p>
                <p className="text-2xl font-bold text-white">{elementTypes.length}</p>
              </div>
              <Database className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0f1642] border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Item Types</p>
                <p className="text-2xl font-bold text-white">
                  {elementTypes.filter(et => et.typeElement === 'Item').length}
                </p>
              </div>
              <Package className="h-8 w-8 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0f1642] border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Account Types</p>
                <p className="text-2xl font-bold text-white">
                  {elementTypes.filter(et => et.typeElement === 'General Accounts').length}
                </p>
              </div>
              <Calculator className="h-8 w-8 text-violet-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card className="bg-[#0f1642] border-blue-900/30">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">Element Types</CardTitle>
              <CardDescription className="text-blue-300">
                {filteredAndSortedElementTypes.length} of {elementTypes.length} element types
              </CardDescription>
            </div>
            {selectedElementTypes.length > 0 && (
              <Badge variant="outline" className="text-blue-400 border-blue-500/30">
                {selectedElementTypes.length} selected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-blue-900/30 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-blue-900/30 hover:bg-blue-900/10">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedElementTypes.length === filteredAndSortedElementTypes.length && filteredAndSortedElementTypes.length > 0}
                      onCheckedChange={handleSelectAllElementTypes}
                      className="border-blue-500/30"
                    />
                  </TableHead>
                  <TableHead className="text-blue-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('code')}
                      className="hover:bg-blue-900/20 text-blue-300 hover:text-white p-0 h-auto font-medium"
                    >
                      Code
                      {sortField === 'code' && (
                        sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-blue-300">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('typeElement')}
                      className="hover:bg-blue-900/20 text-blue-300 hover:text-white p-0 h-auto font-medium"
                    >
                      Type Element
                      {sortField === 'typeElement' && (
                        sortDirection === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-blue-300">Description</TableHead>
                  <TableHead className="text-blue-300">Association</TableHead>
                  <TableHead className="text-blue-300">Table Name</TableHead>
                  <TableHead className="text-blue-300 w-20">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedElementTypes.map((elementType) => (
                  <TableRow key={elementType.id} className="border-blue-900/30 hover:bg-blue-900/10">
                    <TableCell>
                      <Checkbox
                        checked={selectedElementTypes.includes(elementType.id)}
                        onCheckedChange={() => handleSelectElementType(elementType.id)}
                        className="border-blue-500/30"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        {elementType.code}
                        {elementTypesInUse.has(elementType.id) && (
                          <Badge variant="outline" className="text-orange-300 border-orange-500/30 text-xs">
                            In Use
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getTypeBadgeColor(elementType.typeElement)} flex items-center w-fit`}>
                        {getTypeIcon(elementType.typeElement)}
                        <span className="ml-1">{elementType.typeElement}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="text-blue-100">
                      {elementType.description}
                    </TableCell>
                    <TableCell className="text-blue-100">
                      {elementType.itemCode && (
                        <Badge variant="outline" className="text-emerald-300 border-emerald-500/30">
                          Item: {elementType.itemCode}
                        </Badge>
                      )}
                      {elementType.accountCode && (
                        <Badge variant="outline" className="text-violet-300 border-violet-500/30">
                          Account: {elementType.accountCode}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-blue-100">
                      {elementType.tableName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(elementType)}
                                disabled={elementTypesInUse.has(elementType.id)}
                                className={`h-8 w-8 p-0 ${
                                  elementTypesInUse.has(elementType.id)
                                    ? 'text-gray-500 hover:text-gray-500 cursor-not-allowed'
                                    : 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/20'
                                }`}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {elementTypesInUse.has(elementType.id)
                                ? 'Cannot edit - this element type is used by lines'
                                : 'Edit element type'
                              }
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(elementType)}
                                disabled={elementTypesInUse.has(elementType.id)}
                                className={`h-8 w-8 p-0 ${
                                  elementTypesInUse.has(elementType.id)
                                    ? 'text-gray-500 hover:text-gray-500 cursor-not-allowed'
                                    : 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                                }`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {elementTypesInUse.has(elementType.id)
                                ? 'Cannot delete - this element type is used by lines'
                                : 'Delete element type'
                              }
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#0a1033] border-blue-900/30 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-white">Edit Element Type</DialogTitle>
            <DialogDescription className="text-blue-300">
              Update the element type information
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditElementType)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-300">Code *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter unique code"
                          {...field}
                          className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editForm.control}
                  name="typeElement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-300">Type Element *</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            // Clear the opposite field when type changes
                            if (value === 'Item') {
                              editForm.setValue('accountCode', '');
                            } else if (value === 'General Accounts') {
                              editForm.setValue('itemCode', '');
                            }
                          }} 
                          value={field.value}
                        >
                          <SelectTrigger className="bg-[#111633] border-blue-900/50 text-white">
                            <SelectValue placeholder="Select type element" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111633] border-blue-900/50">
                            <SelectItem value="Item">Item</SelectItem>
                            <SelectItem value="General Accounts">General Accounts</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-300">Description *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter description"
                        {...field}
                        className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="tableName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-300">Table Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter table name"
                        {...field}
                        className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              {editForm.watch('typeElement') === 'Item' && (
                <FormField
                  control={editForm.control}
                  name="itemCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-300">Item Code *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="bg-[#111633] border-blue-900/50 text-white">
                            <SelectValue placeholder="Select item" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111633] border-blue-900/50">
                            {items.map(item => (
                              <SelectItem key={item.code} value={item.code}>
                                {item.code} - {item.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              )}

              {editForm.watch('typeElement') === 'General Accounts' && (
                <FormField
                  control={editForm.control}
                  name="accountCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-blue-300">Account Code *</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger className="bg-[#111633] border-blue-900/50 text-white">
                            <SelectValue placeholder="Select account" />
                          </SelectTrigger>
                          <SelectContent className="bg-[#111633] border-blue-900/50">
                            {generalAccounts.map(account => (
                              <SelectItem key={account.code} value={account.code}>
                                {account.code} - {account.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              )}

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  Update Element Type
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#0a1033] border-red-900/30 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
              Delete Element Type
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300">
              Are you sure you want to delete the element type "{selectedElementType?.code}"? 
              This action cannot be undone and may affect associated line items.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-[#111633] border-blue-900/50 text-white hover:bg-blue-900/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteElementType}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Element Type
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Element Type Wizard */}
      <CreateElementTypeWizard
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={fetchData}
        items={items}
        generalAccounts={generalAccounts}
      />
    </div>
  );
};

export default LineElementTypeManagement; 