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
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Hash,
  Package,
  Calendar,
  Filter,
  Download,
  Upload,
  SortAsc,
  SortDesc,
  AlertTriangle,
  Loader2,
  Check,
  X,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Import services and types
import lineElementsService from '@/services/lineElementsService';
import { UniteCode, LignesElementType, CreateUniteCodeRequest, UpdateUniteCodeRequest } from '@/models/lineElements';

// Form validation schema
const uniteCodeSchema = z.object({
  code: z.string().min(1, 'Code is required').max(10, 'Code must be 10 characters or less'),
  description: z.string().min(1, 'Description is required').max(255, 'Description must be 255 characters or less'),
});

type UniteCodeFormData = z.infer<typeof uniteCodeSchema>;

interface UniteCodesManagementProps {
  searchTerm: string;
  elementType?: LignesElementType;
}

const UniteCodesManagement = ({ searchTerm, elementType }: UniteCodesManagementProps) => {
  const [uniteCodes, setUniteCodes] = useState<UniteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof UniteCode>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedUniteCodes, setSelectedUniteCodes] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUniteCode, setSelectedUniteCode] = useState<UniteCode | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  // Code validation states
  const [codeValidation, setCodeValidation] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    message: string;
  }>({
    isValidating: false,
    isValid: null,
    message: '',
  });

  // Edit code validation states
  const [editCodeValidation, setEditCodeValidation] = useState<{
    isValidating: boolean;
    isValid: boolean | null;
    message: string;
  }>({
    isValidating: false,
    isValid: null,
    message: '',
  });

  const form = useForm<UniteCodeFormData>({
    resolver: zodResolver(uniteCodeSchema),
    defaultValues: {
      code: '',
      description: '',
    },
  });

  const editForm = useForm<UniteCodeFormData>({
    resolver: zodResolver(uniteCodeSchema),
    defaultValues: {
      code: '',
      description: '',
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await lineElementsService.uniteCodes.getAll();
      setUniteCodes(data);
    } catch (error) {
      console.error('Failed to fetch unit codes:', error);
      toast.error('Failed to load unit codes data');
    } finally {
      setLoading(false);
    }
  };

  // Code validation function
  const validateCodeUniqueness = async (code: string) => {
    if (!code || code.length < 1) {
      setCodeValidation({
        isValidating: false,
        isValid: null,
        message: '',
      });
      return;
    }

    setCodeValidation(prev => ({
      ...prev,
      isValidating: true,
    }));

    try {
      const isValid = await lineElementsService.uniteCodes.validateCode(code);
      setCodeValidation({
        isValidating: false,
        isValid,
        message: isValid ? 'Code is available' : 'Code already exists',
      });
    } catch (error) {
      console.error('Error validating code:', error);
      setCodeValidation({
        isValidating: false,
        isValid: null,
        message: 'Error validating code',
      });
    }
  };

  // Edit code validation function
  const validateEditCodeUniqueness = async (code: string, excludeCode?: string) => {
    if (!code || code.length < 1) {
      setEditCodeValidation({
        isValidating: false,
        isValid: null,
        message: '',
      });
      return;
    }

    // If code hasn't changed, mark as valid
    if (excludeCode && code.toUpperCase() === excludeCode.toUpperCase()) {
      setEditCodeValidation({
        isValidating: false,
        isValid: true,
        message: 'Current code',
      });
      return;
    }

    setEditCodeValidation(prev => ({
      ...prev,
      isValidating: true,
    }));

    try {
      const isValid = await lineElementsService.uniteCodes.validateCode(code, excludeCode);
      setEditCodeValidation({
        isValidating: false,
        isValid,
        message: isValid ? 'Code is available' : 'Code already exists',
      });
    } catch (error) {
      console.error('Error validating edit code:', error);
      setEditCodeValidation({
        isValidating: false,
        isValid: null,
        message: 'Error validating code',
      });
    }
  };

  // Debounced code validation
  useEffect(() => {
    const code = form.watch('code');
    if (!code) {
      setCodeValidation({
        isValidating: false,
        isValid: null,
        message: '',
      });
      return;
    }

    const timeoutId = setTimeout(() => {
      validateCodeUniqueness(code);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [form.watch('code')]);

  // Debounced edit code validation
  useEffect(() => {
    const code = editForm.watch('code');
    if (!code || !selectedUniteCode) {
      setEditCodeValidation({
        isValidating: false,
        isValid: null,
        message: '',
      });
      return;
    }

    const timeoutId = setTimeout(() => {
      validateEditCodeUniqueness(code, selectedUniteCode.code);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [editForm.watch('code'), selectedUniteCode]);

  const handleCreateUniteCode = async (data: UniteCodeFormData) => {
    try {
      // Check if code validation is still pending or failed
      if (codeValidation.isValidating) {
        toast.error('Please wait for code validation to complete');
        return;
      }

      if (codeValidation.isValid === false) {
        toast.error('Please choose a unique code');
        return;
      }

      const createRequest: CreateUniteCodeRequest = {
        code: data.code.trim().toUpperCase(),
        description: data.description.trim(),
      };
      
      await lineElementsService.uniteCodes.create(createRequest);
      toast.success('Unit code created successfully');
      setIsCreateDialogOpen(false);
      form.reset();
      setCodeValidation({
        isValidating: false,
        isValid: null,
        message: '',
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create unit code:', error);
      toast.error('Failed to create unit code');
    }
  };

  const handleEditUniteCode = async (data: UniteCodeFormData) => {
    if (!selectedUniteCode) return;
    
    try {
      // Check if code validation is still pending or failed (only if code changed)
      const codeChanged = data.code.toUpperCase() !== selectedUniteCode.code.toUpperCase();
      if (codeChanged) {
        if (editCodeValidation.isValidating) {
          toast.error('Please wait for code validation to complete');
          return;
        }

        if (editCodeValidation.isValid === false) {
          toast.error('Please choose a unique code');
          return;
        }
      }

      const updateRequest: UpdateUniteCodeRequest = {
        code: codeChanged ? data.code.trim().toUpperCase() : undefined,
        description: data.description.trim(),
      };
      
      await lineElementsService.uniteCodes.update(selectedUniteCode.code, updateRequest);
      toast.success('Unit code updated successfully');
      setIsEditDialogOpen(false);
      setSelectedUniteCode(null);
      editForm.reset();
      setEditCodeValidation({
        isValidating: false,
        isValid: null,
        message: '',
      });
      fetchData();
    } catch (error) {
      console.error('Failed to update unit code:', error);
      toast.error('Failed to update unit code');
    }
  };

  const handleDeleteUniteCode = async () => {
    if (!selectedUniteCode) return;
    
    try {
      await lineElementsService.uniteCodes.delete(selectedUniteCode.code);
      toast.success('Unit code deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedUniteCode(null);
      fetchData();
    } catch (error) {
      console.error('Failed to delete unit code:', error);
      toast.error('Failed to delete unit code');
    }
  };

  const openEditDialog = (uniteCode: UniteCode) => {
    setSelectedUniteCode(uniteCode);
    editForm.reset({
      code: uniteCode.code,
      description: uniteCode.description,
    });
    setEditCodeValidation({
      isValidating: false,
      isValid: null,
      message: '',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (uniteCode: UniteCode) => {
    setSelectedUniteCode(uniteCode);
    setIsDeleteDialogOpen(true);
  };

  const handleSort = (field: keyof UniteCode) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof UniteCode) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  const filteredAndSortedUniteCodes = useMemo(() => {
    let filtered = uniteCodes.filter(uniteCode => {
      const searchTermLower = (searchTerm || localSearchTerm).toLowerCase();
      return (
        uniteCode.code.toLowerCase().includes(searchTermLower) ||
        uniteCode.description.toLowerCase().includes(searchTermLower)
      );
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue: string;
      let bValue: string;
      
      switch (sortField) {
        case 'code':
          aValue = a.code;
          bValue = b.code;
          break;
        case 'description':
          aValue = a.description;
          bValue = b.description;
          break;
        default:
          aValue = a.code;
          bValue = b.code;
      }
      
      const comparison = aValue.localeCompare(bValue);
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [uniteCodes, searchTerm, localSearchTerm, sortField, sortDirection]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-blue-300 font-medium">Loading unit codes...</p>
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
            <Hash className="mr-2 h-5 w-5 text-blue-400" />
            Unit Codes Management
          </h2>
          <p className="text-sm text-blue-300 mt-1">
            Manage measurement units ({filteredAndSortedUniteCodes.length} unit codes)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              form.reset();
              setCodeValidation({
                isValidating: false,
                isValid: null,
                message: '',
              });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Unit Code
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-xl text-blue-100 flex items-center">
                  <Hash className="mr-2 h-5 w-5 text-blue-400" />
                  Create New Unit Code
                </DialogTitle>
                <DialogDescription className="text-blue-300">
                  Add a new measurement unit to the system.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleCreateUniteCode)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-200">Code</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              placeholder="Enter unit code (e.g., KG, M, L)" 
                              {...field} 
                              className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500 pr-10"
                              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {codeValidation.isValidating && (
                                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                              )}
                              {codeValidation.isValid === true && (
                                <Check className="h-4 w-4 text-green-500" />
                              )}
                              {codeValidation.isValid === false && (
                                <X className="h-4 w-4 text-red-500" />
                              )}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400" />
                        {codeValidation.message && (
                          <p className={`text-xs mt-1 ${
                            codeValidation.isValid === true 
                              ? 'text-green-400' 
                              : codeValidation.isValid === false 
                              ? 'text-red-400' 
                              : 'text-blue-300'
                          }`}>
                            {codeValidation.message}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-blue-200">Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter unit description"
                            {...field}
                            className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="border-blue-800/40 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={codeValidation.isValidating || codeValidation.isValid === false}
                      className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {codeValidation.isValidating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Validating...
                        </>
                      ) : (
                        'Create Unit Code'
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
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
                  placeholder="Search unit codes by code or description..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={`${sortField}-${sortDirection}`} onValueChange={(value) => {
                const [field, direction] = value.split('-');
                setSortField(field as keyof UniteCode);
                setSortDirection(direction as 'asc' | 'desc');
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="code-asc">Code (A-Z)</SelectItem>
                  <SelectItem value="code-desc">Code (Z-A)</SelectItem>
                  <SelectItem value="description-asc">Description (A-Z)</SelectItem>
                  <SelectItem value="description-desc">Description (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unit Codes Table */}
      <Card className="bg-[#0f1642] border-blue-900/30">
        <CardHeader>
          <CardTitle className="text-lg text-white">Unit Codes List</CardTitle>
          <CardDescription className="text-blue-300">
            {filteredAndSortedUniteCodes.length} of {uniteCodes.length} unit codes
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-blue-900/20">
                <TableRow className="border-blue-900/50">
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
                  <TableHead className="text-blue-300">Items Count</TableHead>
                  <TableHead className="text-blue-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedUniteCodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Hash className="h-8 w-8 text-blue-400/50" />
                        <p className="text-blue-300">No unit codes found</p>
                        <p className="text-sm text-blue-400">
                          {uniteCodes.length === 0 ? 'Create your first unit code to get started' : 'Try adjusting your search criteria'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedUniteCodes.map((uniteCode) => (
                    <TableRow key={uniteCode.code} className="border-blue-900/30 hover:bg-blue-900/20 transition-colors">
                      <TableCell className="font-medium text-blue-100">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-900/20">
                            {uniteCode.code}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-200 max-w-xs">
                        <div className="truncate" title={uniteCode.description}>
                          {uniteCode.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-200">
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-900/20">
                          {uniteCode.itemsCount || 0} items
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(uniteCode)}
                            className="hover:bg-blue-50 hover:text-blue-700"
                            title="Edit unit code"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(uniteCode)}
                            disabled={uniteCode.itemsCount > 0}
                            className={`${
                              uniteCode.itemsCount > 0 
                                ? 'opacity-50 cursor-not-allowed text-gray-400' 
                                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                            }`}
                            title={uniteCode.itemsCount > 0 ? 'Cannot delete: Unit is used by items' : 'Delete unit code'}
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
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setSelectedUniteCode(null);
          editForm.reset();
          setEditCodeValidation({
            isValidating: false,
            isValid: null,
            message: '',
          });
        }
      }}>
        <DialogContent className="bg-gradient-to-b from-[#1a2c6b]/95 to-[#0a1033]/95 backdrop-blur-md border-blue-500/30 text-white shadow-[0_0_25px_rgba(59,130,246,0.2)] rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-blue-100 flex items-center">
              <Edit className="mr-2 h-5 w-5 text-blue-400" />
              Edit Unit Code
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Update the unit code information.
            </DialogDescription>
          </DialogHeader>
          {selectedUniteCode && selectedUniteCode.itemsCount > 0 && (
            <div className="bg-blue-900/20 p-3 rounded-lg border border-blue-500/30">
              <p className="text-blue-300 text-sm flex items-center">
                <Info className="mr-2 h-4 w-4" />
                <strong>Info:</strong> This unit code is used by {selectedUniteCode.itemsCount} items. 
                Changing the code will automatically update all associated items.
              </p>
            </div>
          )}
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditUniteCode)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Code</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Enter unit code (e.g., KG, M, L)" 
                          {...field} 
                          className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500 pr-10"
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {editCodeValidation.isValidating && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                          )}
                          {editCodeValidation.isValid === true && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                          {editCodeValidation.isValid === false && (
                            <X className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-400" />
                    {editCodeValidation.message && (
                      <p className={`text-xs mt-1 ${
                        editCodeValidation.isValid === true 
                          ? 'text-green-400' 
                          : editCodeValidation.isValid === false 
                          ? 'text-red-400' 
                          : 'text-blue-300'
                      }`}>
                        {editCodeValidation.message}
                      </p>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Description</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter unit description"
                        {...field}
                        className="bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
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
                  disabled={editCodeValidation.isValidating || editCodeValidation.isValid === false}
                  className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editCodeValidation.isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    'Update Unit Code'
                  )}
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
              Delete Unit Code
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Are you sure you want to delete this unit code? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUniteCode && (
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
              <p className="text-blue-200">
                <strong>Code:</strong> {selectedUniteCode.code}
              </p>
              <p className="text-blue-200">
                <strong>Description:</strong> {selectedUniteCode.description}
              </p>
              {selectedUniteCode.itemsCount > 0 && (
                <p className="text-red-400 mt-2 flex items-center">
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  This unit code is used by {selectedUniteCode.itemsCount} items and cannot be deleted.
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
              onClick={handleDeleteUniteCode}
              disabled={selectedUniteCode?.itemsCount > 0}
              className="bg-red-900/30 text-red-300 hover:bg-red-900/50 hover:text-red-200 border border-red-500/30 hover:border-red-400/50"
            >
              Delete Unit Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UniteCodesManagement; 