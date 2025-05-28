import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Search,
  Users,
  FileText,
  Power,
  PowerOff,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import responsibilityCentreService from '@/services/responsibilityCentreService';
import {
  ResponsibilityCentre,
  CreateResponsibilityCentreRequest,
  UpdateResponsibilityCentreRequest,
} from '@/models/responsibilityCentre';

const ResponsibilityCentreManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [centres, setCentres] = useState<ResponsibilityCentre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCentre, setSelectedCentre] = useState<ResponsibilityCentre | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    code: '',
    descr: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [codeValidation, setCodeValidation] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);

  // Check admin access
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'Admin') {
      toast.error('You do not have permission to access this page');
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch centres
  useEffect(() => {
    fetchCentres();
  }, []);

  // Validate code when it changes
  useEffect(() => {
    const validateCode = async () => {
      if (!formData.code.trim() || (!isCreateDialogOpen && !isEditDialogOpen)) {
        setCodeValidation(null);
        return;
      }

      if (formData.code.length < 2) {
        setCodeValidation({
          isValid: false,
          message: 'Code must be at least 2 characters long',
        });
        return;
      }

      // Skip validation if editing and code hasn't changed
      if (isEditDialogOpen && selectedCentre && formData.code === selectedCentre.code) {
        setCodeValidation({ isValid: true, message: 'Current code' });
        return;
      }

      try {
        setIsValidatingCode(true);
        const isAvailable = await responsibilityCentreService.validateCode(formData.code);
        setCodeValidation({
          isValid: isAvailable,
          message: isAvailable ? 'Code is available' : 'Code is already taken',
        });
      } catch (error) {
        console.error('Error validating code:', error);
        setCodeValidation({
          isValid: false,
          message: 'Error validating code',
        });
      } finally {
        setIsValidatingCode(false);
      }
    };

    const timeoutId = setTimeout(validateCode, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.code, isCreateDialogOpen, isEditDialogOpen, selectedCentre]);

  const fetchCentres = async () => {
    try {
      setIsLoading(true);
      const data = await responsibilityCentreService.getAll();
      setCentres(data);
    } catch (error) {
      console.error('Failed to fetch responsibility centres:', error);
      toast.error('Failed to load responsibility centres');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCentres = centres.filter(
    (centre) =>
      centre.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centre.descr.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ code: '', descr: '' });
    setCodeValidation(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (centre: ResponsibilityCentre) => {
    setSelectedCentre(centre);
    setFormData({
      code: centre.code,
      descr: centre.descr,
    });
    setCodeValidation(null);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (centre: ResponsibilityCentre) => {
    setSelectedCentre(centre);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!codeValidation?.isValid || formData.descr.trim().length < 3) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    try {
      setIsSubmitting(true);
      const request: CreateResponsibilityCentreRequest = {
        code: formData.code.toUpperCase(),
        descr: formData.descr.trim(),
      };
      
      await responsibilityCentreService.create(request);
      toast.success('Responsibility centre created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchCentres();
    } catch (error: any) {
      console.error('Failed to create responsibility centre:', error);
      toast.error(error.response?.data?.message || 'Failed to create responsibility centre');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedCentre || !codeValidation?.isValid || formData.descr.trim().length < 3) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    try {
      setIsSubmitting(true);
      const request: UpdateResponsibilityCentreRequest = {
        code: formData.code.toUpperCase(),
        descr: formData.descr.trim(),
      };
      
      await responsibilityCentreService.update(selectedCentre.id, request);
      toast.success('Responsibility centre updated successfully');
      setIsEditDialogOpen(false);
      resetForm();
      fetchCentres();
    } catch (error: any) {
      console.error('Failed to update responsibility centre:', error);
      toast.error(error.response?.data?.message || 'Failed to update responsibility centre');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCentre) return;

    try {
      setIsSubmitting(true);
      await responsibilityCentreService.delete(selectedCentre.id);
      toast.success('Responsibility centre deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchCentres();
    } catch (error: any) {
      console.error('Failed to delete responsibility centre:', error);
      toast.error(error.response?.data?.message || 'Failed to delete responsibility centre');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (centre: ResponsibilityCentre) => {
    try {
      if (centre.isActive) {
        await responsibilityCentreService.deactivate(centre.id);
        toast.success('Responsibility centre deactivated');
      } else {
        await responsibilityCentreService.activate(centre.id);
        toast.success('Responsibility centre activated');
      }
      fetchCentres();
    } catch (error: any) {
      console.error('Failed to toggle centre status:', error);
      toast.error(error.response?.data?.message || 'Failed to update centre status');
    }
  };

  const isFormValid = () => {
    return (
      codeValidation?.isValid === true &&
      formData.descr.trim().length >= 3
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Responsibility Centre Management"
        description="Manage responsibility centres for document organization"
        icon={<Building2 className="h-8 w-8" />}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#0a1033] border-blue-900/30">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-white">{centres.length}</p>
                <p className="text-sm text-gray-400">Total Centres</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0a1033] border-blue-900/30">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Power className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {centres.filter(c => c.isActive).length}
                </p>
                <p className="text-sm text-gray-400">Active Centres</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#0a1033] border-blue-900/30">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {centres.reduce((sum, c) => sum + (c.usersCount || 0), 0)}
                </p>
                <p className="text-sm text-gray-400">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search centres..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white"
          />
        </div>
        <Button onClick={openCreateDialog} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Centre
        </Button>
      </div>

      {/* Centres Table */}
      <Card className="bg-[#0a1033] border-blue-900/30">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700">
                <TableHead className="text-gray-300">Code</TableHead>
                <TableHead className="text-gray-300">Description</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
                <TableHead className="text-gray-300">Users</TableHead>
                <TableHead className="text-gray-300">Documents</TableHead>
                <TableHead className="text-gray-300">Created</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCentres.map((centre) => (
                <TableRow key={centre.id} className="border-gray-700">
                  <TableCell className="font-medium text-white">
                    {centre.code}
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {centre.descr}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={centre.isActive ? 'default' : 'secondary'}
                      className={centre.isActive ? 'bg-green-600' : 'bg-gray-600'}
                    >
                      {centre.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4" />
                      <span>{centre.usersCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{centre.documentsCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">
                    {new Date(centre.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(centre)}
                        className="text-gray-400 hover:text-white"
                      >
                        {centre.isActive ? (
                          <PowerOff className="h-4 w-4" />
                        ) : (
                          <Power className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(centre)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(centre)}
                        className="text-gray-400 hover:text-red-400"
                        disabled={centre.usersCount > 0 || centre.documentsCount > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredCentres.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {searchTerm ? 'No centres match your search' : 'No responsibility centres found'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create Responsibility Centre</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a new responsibility centre to organize documents and users.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-code" className="text-white">
                Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., FINANCE, HR, IT"
                className="bg-gray-700 border-gray-600 text-white"
                maxLength={50}
              />
              {codeValidation && (
                <div className={`flex items-center space-x-2 text-sm ${
                  codeValidation.isValid ? 'text-green-400' : 'text-red-400'
                }`}>
                  {codeValidation.isValid ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span>{codeValidation.message}</span>
                </div>
              )}
              {isValidatingCode && (
                <div className="text-sm text-gray-400">Validating code...</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-descr" className="text-white">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="create-descr"
                value={formData.descr}
                onChange={(e) => setFormData({ ...formData, descr: e.target.value })}
                placeholder="e.g., Finance Department, Human Resources"
                className="bg-gray-700 border-gray-600 text-white"
                maxLength={200}
                rows={3}
              />
              <div className="text-sm text-gray-400">
                {formData.descr.length}/200 characters
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!isFormValid() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Centre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Responsibility Centre</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the responsibility centre information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-code" className="text-white">
                Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g., FINANCE, HR, IT"
                className="bg-gray-700 border-gray-600 text-white"
                maxLength={50}
              />
              {codeValidation && (
                <div className={`flex items-center space-x-2 text-sm ${
                  codeValidation.isValid ? 'text-green-400' : 'text-red-400'
                }`}>
                  {codeValidation.isValid ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <span>{codeValidation.message}</span>
                </div>
              )}
              {isValidatingCode && (
                <div className="text-sm text-gray-400">Validating code...</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-descr" className="text-white">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="edit-descr"
                value={formData.descr}
                onChange={(e) => setFormData({ ...formData, descr: e.target.value })}
                placeholder="e.g., Finance Department, Human Resources"
                className="bg-gray-700 border-gray-600 text-white"
                maxLength={200}
                rows={3}
              />
              <div className="text-sm text-gray-400">
                {formData.descr.length}/200 characters
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!isFormValid() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Centre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Responsibility Centre</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete "{selectedCentre?.code}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCentre && (selectedCentre.usersCount > 0 || selectedCentre.documentsCount > 0) && (
            <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Cannot delete</span>
              </div>
              <p className="text-sm text-red-300 mt-1">
                This centre has {selectedCentre.usersCount} users and {selectedCentre.documentsCount} documents assigned to it.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                isSubmitting ||
                (selectedCentre && (selectedCentre.usersCount > 0 || selectedCentre.documentsCount > 0))
              }
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete Centre
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResponsibilityCentreManagement;