import { useState, useEffect, useMemo, useRef } from 'react';
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
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Package, 
  Hash,
  Calendar,
  MoreHorizontal,
  Filter,
  Download,
  Upload,
  SortAsc,
  SortDesc,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Import services and types
import lineElementsService from '@/services/lineElementsService';
import { Item, UniteCode, LignesElementType, CreateItemRequest, UpdateItemRequest } from '@/models/lineElements';

// Import the new wizard component
import CreateItemWizard from './CreateItemWizard';

// Form validation schema for edit form
const itemSchema = z.object({
  code: z.string().min(1, 'Code is required').max(50, 'Code must be 50 characters or less'),
  description: z.string().max(255, 'Description must be 255 characters or less').optional(),
  unite: z.string().min(1, 'Unit code is required'),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface ItemsManagementProps {
  searchTerm: string;
  elementType?: LignesElementType;
}

const ItemsManagement = ({ searchTerm, elementType }: ItemsManagementProps) => {
  const [items, setItems] = useState<Item[]>([]);
  const [uniteCodes, setUniteCodes] = useState<UniteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof Item>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [selectedUniteFilter, setSelectedUniteFilter] = useState<string>('all');

  // Edit form state
  const editForm = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      code: '',
      description: '',
      unite: '',
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsData, uniteCodesData] = await Promise.all([
        lineElementsService.items.getAll(),
        lineElementsService.uniteCodes.getAll()
      ]);
      setItems(itemsData);
      setUniteCodes(uniteCodesData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load items data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedItems = useMemo(() => {
    let filtered = items.filter(item => {
      const matchesSearch = 
        item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(localSearchTerm.toLowerCase());
      
      const matchesUnite = selectedUniteFilter === 'all' || 
        (selectedUniteFilter === 'no-unit' && !item.unite) ||
        item.unite === selectedUniteFilter;

      return matchesSearch && matchesUnite;
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
  }, [items, searchTerm, localSearchTerm, selectedUniteFilter, sortField, sortDirection]);

  const handleEditItem = async (data: ItemFormData) => {
    if (!selectedItem) return;
    
    try {
      const updateRequest: UpdateItemRequest = {
        description: data.description.trim(),
        unite: data.unite,
      };
      
      await lineElementsService.items.update(selectedItem.code, updateRequest);
      toast.success('Item updated successfully');
      setIsEditDialogOpen(false);
      setSelectedItem(null);
      editForm.reset();
      fetchData();
    } catch (error) {
      console.error('Failed to update item:', error);
      toast.error('Failed to update item');
    }
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    
    try {
      await lineElementsService.items.delete(selectedItem.code);
      toast.success('Item deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedItem(null);
      fetchData();
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item');
    }
  };

  const openEditDialog = (item: Item) => {
    setSelectedItem(item);
    editForm.reset({
      code: item.code,
      description: item.description,
      unite: item.unite,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: Item) => {
    setSelectedItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSort = (field: keyof Item) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof Item) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  // Checkbox selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredAndSortedItems.map(item => item.code));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (itemCode: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemCode]);
    } else {
      setSelectedItems(prev => prev.filter(code => code !== itemCode));
    }
  };

  const isAllSelected = filteredAndSortedItems.length > 0 && selectedItems.length === filteredAndSortedItems.length;

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedItems.map(code => lineElementsService.items.delete(code)));
      toast.success(`${selectedItems.length} items deleted successfully`);
      setSelectedItems([]);
      fetchData();
    } catch (error) {
      console.error('Failed to delete items:', error);
      toast.error('Failed to delete some items');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-blue-300 font-medium">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Package className="mr-2 h-5 w-5 text-blue-400" />
            Items Management
          </h2>
          <p className="text-sm text-blue-300 mt-1">
            Manage physical items and products ({filteredAndSortedItems.length} items)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="bg-[#0f1642] border-blue-900/30">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
                <Input
                  placeholder="Search items by code, description, or unit..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-blue-400" />
              <Select value={selectedUniteFilter} onValueChange={setSelectedUniteFilter}>
                <SelectTrigger className="w-48 bg-[#111633] border-blue-900/50 text-white focus:border-blue-500 focus:ring-blue-500">
                  <SelectValue placeholder="Filter by unit" />
                </SelectTrigger>
                <SelectContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white">
                  <SelectItem value="all">All units</SelectItem>
                  <SelectItem value="no-unit">No unit assigned</SelectItem>
                  {uniteCodes.map((unit) => (
                    <SelectItem key={unit.code} value={unit.code} className="text-white hover:bg-blue-900/30">
                      {unit.code} - {unit.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg mb-4">
          <span className="text-blue-200">
            {selectedItems.length} item{selectedItems.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedItems([])}
              className="border-blue-500/30 text-blue-300 hover:bg-blue-900/30"
            >
              Clear Selection
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-blue-100">Delete Selected Items</AlertDialogTitle>
                  <AlertDialogDescription className="text-blue-300">
                    Are you sure you want to delete {selectedItems.length} selected item{selectedItems.length > 1 ? 's' : ''}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-blue-500/30 text-blue-300 hover:bg-blue-900/30">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleBulkDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}

      {/* Items Table */}
      <Card className="bg-[#0f1642] border-blue-900/30">
        <CardHeader>
          <CardTitle className="text-lg text-white">Items List</CardTitle>
          <CardDescription className="text-blue-300">
            {filteredAndSortedItems.length} of {items.length} items
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-blue-900/20">
                <TableRow className="border-blue-900/50">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      className="border-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                    />
                  </TableHead>
                  <TableHead 
                    className="text-blue-300 cursor-pointer hover:text-blue-200 transition-colors"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Code</span>
                      {getSortIcon('code')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-blue-300 cursor-pointer hover:text-blue-200 transition-colors"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Description</span>
                      {getSortIcon('description')}
                    </div>
                  </TableHead>
                  <TableHead className="text-blue-300">Unit</TableHead>
                  <TableHead className="text-blue-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Package className="h-8 w-8 text-blue-400/50" />
                        <p className="text-blue-300">No items found</p>
                        <p className="text-sm text-blue-400">
                          {items.length === 0 ? 'Create your first item to get started' : 'Try adjusting your search or filter criteria'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedItems.map((item) => (
                    <TableRow 
                      key={item.code} 
                      className="border-blue-900/30 hover:bg-blue-900/20 transition-colors"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.includes(item.code)}
                          onCheckedChange={(checked) => handleSelectItem(item.code, checked as boolean)}
                          className="border-blue-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                        />
                      </TableCell>
                      <TableCell className="font-mono text-blue-200">{item.code}</TableCell>
                      <TableCell className="text-blue-200 max-w-xs">
                        <div className="truncate" title={item.description}>
                          {item.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-200">
                        {item.unite ? (
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400 bg-amber-900/20">
                              {item.unite}
                            </Badge>
                            {item.uniteCodeNavigation && (
                              <span className="text-xs text-blue-400" title={item.uniteCodeNavigation.description}>
                                {item.uniteCodeNavigation.description}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-blue-400 text-xs italic">No unit</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(item)}
                            disabled={item.elementTypesCount > 0}
                            className={`${
                              item.elementTypesCount > 0 
                                ? 'opacity-50 cursor-not-allowed text-gray-400' 
                                : 'hover:bg-blue-50 hover:text-blue-700'
                            }`}
                            title={item.elementTypesCount > 0 ? 'Cannot edit: Item is referenced by element types' : 'Edit item'}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(item)}
                            disabled={item.elementTypesCount > 0}
                            className={`${
                              item.elementTypesCount > 0 
                                ? 'opacity-50 cursor-not-allowed text-gray-400' 
                                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                            }`}
                            title={item.elementTypesCount > 0 ? 'Cannot delete: Item is referenced by element types' : 'Delete item'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-100 flex items-center">
              <Edit className="mr-2 h-5 w-5 text-blue-400" />
              Edit Item
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Update the item information. The code cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditItem)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter item code" 
                        {...field} 
                        readOnly
                        className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500 opacity-60 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Description (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter item description (optional)" 
                        {...field} 
                        className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="unite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Unit Code *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-[#111633] border-blue-900/50 text-white focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Select a unit code" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-blue-500/30 text-white">
                        {uniteCodes.map((unit) => (
                          <SelectItem key={unit.code} value={unit.code} className="text-white hover:bg-blue-900/30">
                            {unit.code} - {unit.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-blue-800/40 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update Item
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-100 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
              Delete Item
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedItem && (
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
              <p className="text-blue-200">
                <strong>Code:</strong> {selectedItem.code}
              </p>
              <p className="text-blue-200">
                <strong>Description:</strong> {selectedItem.description}
              </p>
              {selectedItem.elementTypesCount > 0 && (
                <p className="text-red-400 mt-2 flex items-center">
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  This item is referenced by {selectedItem.elementTypesCount} element types and cannot be deleted.
                </p>
              )}
            </div>
          )}
          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
              className="border-blue-800/40 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteItem}
              disabled={selectedItem?.elementTypesCount > 0}
              className="bg-red-900/30 text-red-300 hover:bg-red-900/50 hover:text-red-200 border border-red-500/30 hover:border-red-400/50"
            >
              Delete Item
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Item Wizard */}
      <CreateItemWizard
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          fetchData();
        }}
        uniteCodes={uniteCodes}
      />
    </div>
  );
};

export default ItemsManagement; 