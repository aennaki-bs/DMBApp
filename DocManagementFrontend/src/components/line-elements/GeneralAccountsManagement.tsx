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
  Calculator,
  FileText,
  Calendar,
  MoreHorizontal,
  Filter,
  Download,
  Upload,
  SortAsc,
  SortDesc,
  AlertTriangle,
  Loader2,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Import services and types
import lineElementsService from '@/services/lineElementsService';
import { GeneralAccounts, LignesElementType, CreateGeneralAccountsRequest, UpdateGeneralAccountsRequest } from '@/models/lineElements';

// Import the new wizard component
import CreateGeneralAccountWizard from './CreateGeneralAccountWizard';

// Form validation schema
const generalAccountSchema = z.object({
  code: z.string().min(1, 'Code is required').max(20, 'Code must be 20 characters or less'),
  description: z.string().min(1, 'Description is required').max(255, 'Description must be 255 characters or less'),
});

type GeneralAccountFormData = z.infer<typeof generalAccountSchema>;

interface GeneralAccountsManagementProps {
  searchTerm: string;
  elementType?: LignesElementType;
}

const GeneralAccountsManagement = ({ searchTerm, elementType }: GeneralAccountsManagementProps) => {
  const [accounts, setAccounts] = useState<GeneralAccounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof GeneralAccounts>('code');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<GeneralAccounts | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState('');

  const editForm = useForm<GeneralAccountFormData>({
    resolver: zodResolver(generalAccountSchema),
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
      const data = await lineElementsService.generalAccounts.getAll();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch general accounts:', error);
      toast.error('Failed to load general accounts data');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedAccounts = useMemo(() => {
    let filtered = accounts.filter(account => {
      const matchesSearch = 
        account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.code.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
        account.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.description.toLowerCase().includes(localSearchTerm.toLowerCase());
      
      return matchesSearch;
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
  }, [accounts, searchTerm, localSearchTerm, sortField, sortDirection]);

  // Checkbox selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAccounts(filteredAndSortedAccounts.map(account => account.code));
    } else {
      setSelectedAccounts([]);
    }
  };

  const handleSelectAccount = (accountCode: string, checked: boolean) => {
    if (checked) {
      setSelectedAccounts(prev => [...prev, accountCode]);
    } else {
      setSelectedAccounts(prev => prev.filter(code => code !== accountCode));
    }
  };

  const isAllSelected = filteredAndSortedAccounts.length > 0 && selectedAccounts.length === filteredAndSortedAccounts.length;

  const handleBulkDelete = async () => {
    try {
      await Promise.all(selectedAccounts.map(code => lineElementsService.generalAccounts.delete(code)));
      toast.success(`${selectedAccounts.length} accounts deleted successfully`);
      setSelectedAccounts([]);
      fetchData();
    } catch (error) {
      console.error('Failed to delete accounts:', error);
      toast.error('Failed to delete some accounts');
    }
  };

  const handleEditAccount = async (data: GeneralAccountFormData) => {
    if (!selectedAccount) return;
    
    try {
      // Only validate code format if it has changed and account is not in use
      if (selectedAccount.lignesCount === 0 && data.code.trim() !== selectedAccount.code) {
        const codeValue = data.code.trim();
        
        // Check alphanumeric format
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;
        if (!alphanumericRegex.test(codeValue)) {
          toast.error('Code must be alphanumeric (letters and numbers only)');
          return;
        }
        
        // Check length
        if (codeValue.length < 1 || codeValue.length > 20) {
          toast.error('Code must be between 1 and 20 characters');
          return;
        }
      }

      const updateRequest: UpdateGeneralAccountsRequest = {
        // Only send code if account is not in use
        ...(selectedAccount.lignesCount === 0 && { code: data.code.trim() }),
        description: data.description.trim(),
      };
      
      await lineElementsService.generalAccounts.update(selectedAccount.code, updateRequest);
      toast.success('General account updated successfully');
      setIsEditDialogOpen(false);
      setSelectedAccount(null);
      editForm.reset();
      fetchData();
    } catch (error: any) {
      console.error('Failed to update general account:', error);
      toast.error(error.response?.data?.message || 'Failed to update general account');
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;
    
    try {
      await lineElementsService.generalAccounts.delete(selectedAccount.code);
      toast.success('General account deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedAccount(null);
      fetchData();
    } catch (error: any) {
      console.error('Failed to delete general account:', error);
      toast.error(error.response?.data?.message || 'Failed to delete general account');
    }
  };

  const openEditDialog = (account: GeneralAccounts) => {
    setSelectedAccount(account);
    editForm.reset({
      code: account.code,
      description: account.description,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (account: GeneralAccounts) => {
    setSelectedAccount(account);
    setIsDeleteDialogOpen(true);
  };

  const handleSort = (field: keyof GeneralAccounts) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof GeneralAccounts) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-blue-300 font-medium">Loading general accounts...</p>
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
            <Calculator className="mr-2 h-5 w-5 text-blue-400" />
            General Accounts Management
          </h2>
          <p className="text-sm text-blue-300 mt-1">
            Manage accounting codes and general accounts ({filteredAndSortedAccounts.length} accounts)
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add General Account
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
                  placeholder="Search general accounts..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="pl-10 bg-[#111633] border-blue-900/50 text-white placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={`${sortField}-${sortDirection}`} onValueChange={(value) => {
                const [field, direction] = value.split('-');
                setSortField(field as keyof GeneralAccounts);
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

      {/* Bulk Actions */}
      {selectedAccounts.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-purple-900/30 border border-purple-500/30 rounded-lg mb-4">
          <span className="text-purple-200">
            {selectedAccounts.length} account{selectedAccounts.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedAccounts([])}
              className="border-purple-500/30 text-purple-300 hover:bg-purple-900/30"
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
              <AlertDialogContent className="bg-gradient-to-b from-[#1a2c6b] to-[#0a1033] border-purple-500/30">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-purple-100">Delete Selected Accounts</AlertDialogTitle>
                  <AlertDialogDescription className="text-purple-300">
                    Are you sure you want to delete {selectedAccounts.length} selected account{selectedAccounts.length > 1 ? 's' : ''}? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-purple-500/30 text-purple-300 hover:bg-purple-900/30">
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

      {/* General Accounts Table */}
      <Card className="bg-[#0f1642] border-blue-900/30">
        <CardHeader>
          <CardTitle className="text-lg text-white">General Accounts List</CardTitle>
          <CardDescription className="text-blue-300">
            {filteredAndSortedAccounts.length} of {accounts.length} accounts
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
                      className="border-purple-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
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
                  <TableHead className="text-blue-300">Lines Count</TableHead>
                  <TableHead className="text-blue-300 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <CreditCard className="h-8 w-8 text-blue-400/50" />
                        <p className="text-blue-300">No general accounts found</p>
                        <p className="text-sm text-blue-400">
                          {accounts.length === 0 ? 'Create your first account to get started' : 'Try adjusting your search criteria'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAndSortedAccounts.map((account) => (
                    <TableRow key={account.code} className="border-blue-900/30 hover:bg-blue-900/20 transition-colors">
                      <TableCell>
                        <Checkbox
                          checked={selectedAccounts.includes(account.code)}
                          onCheckedChange={(checked) => handleSelectAccount(account.code, checked as boolean)}
                          className="border-purple-500 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                        />
                      </TableCell>
                      <TableCell className="font-medium text-blue-100">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-900/20">
                            {account.code}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-200 max-w-xs">
                        <div className="truncate" title={account.description}>
                          {account.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-200">
                        <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-900/20">
                          {account.lignesCount || 0} lines
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(account)}
                            disabled={account.lignesCount > 0}
                            className={`${
                              account.lignesCount > 0 
                                ? 'opacity-50 cursor-not-allowed text-gray-400' 
                                : 'hover:bg-blue-50 hover:text-blue-700'
                            }`}
                            title={account.lignesCount > 0 ? 'Cannot edit: Account is used in document lines' : 'Edit account'}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(account)}
                            disabled={account.lignesCount > 0}
                            className={`${
                              account.lignesCount > 0 
                                ? 'opacity-50 cursor-not-allowed text-gray-400' 
                                : 'text-red-600 hover:text-red-700 hover:bg-red-50'
                            }`}
                            title={account.lignesCount > 0 ? 'Cannot delete: Account is used in document lines' : 'Delete account'}
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
              Edit General Account
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Update general account information. The code cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditAccount)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">
                      Code * 
                      {selectedAccount?.lignesCount > 0 && (
                        <span className="text-amber-400 text-xs ml-2">
                          (Cannot edit: Account is in use)
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter account code" 
                        {...field} 
                        disabled={selectedAccount?.lignesCount > 0}
                        className={`bg-[#111633] border-blue-900/50 placeholder:text-blue-400 focus:border-blue-500 focus:ring-blue-500 ${
                          selectedAccount?.lignesCount > 0 
                            ? 'text-gray-400 cursor-not-allowed' 
                            : 'text-white'
                        }`}
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                    {selectedAccount?.lignesCount > 0 && (
                      <p className="text-amber-400 text-xs mt-1">
                        Code cannot be changed because this account is referenced by {selectedAccount.lignesCount} line element types.
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
                    <FormLabel className="text-blue-200">Description *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter account description"
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
                  onClick={() => { setIsEditDialogOpen(false); editForm.reset(); }}
                  className="border-blue-800/40 text-blue-300 hover:bg-blue-800/20 hover:text-blue-200"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Update General Account
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
              Delete General Account
            </DialogTitle>
            <DialogDescription className="text-blue-300">
              Are you sure you want to delete this general account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedAccount && (
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-900/30">
              <p className="text-blue-200">
                <strong>Code:</strong> {selectedAccount.code}
              </p>
              <p className="text-blue-200">
                <strong>Description:</strong> {selectedAccount.description}
              </p>
              {selectedAccount.lignesCount > 0 && (
                <p className="text-red-400 mt-2 flex items-center">
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  This account is used in {selectedAccount.lignesCount} document lines and cannot be deleted.
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
              onClick={handleDeleteAccount}
              disabled={selectedAccount?.lignesCount > 0}
              className="bg-red-900/30 text-red-300 hover:bg-red-900/50 hover:text-red-200 border border-red-500/30 hover:border-red-400/50"
            >
              Delete Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create General Account Wizard */}
      <CreateGeneralAccountWizard
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          fetchData();
        }}
      />
    </div>
  );
};

export default GeneralAccountsManagement; 