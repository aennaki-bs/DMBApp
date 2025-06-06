import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Search, Truck, FileText, AlertTriangle, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import vendorService from "@/services/vendorService";
import { Vendor, UpdateVendorRequest } from "@/models/vendor";
import CreateVendorWizard from "./CreateVendorWizard";

export default function VendorManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof Vendor>("vendorCode");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
  });

  const { data: vendors = [], isLoading, error } = useQuery({
    queryKey: ["vendors"],
    queryFn: vendorService.getAll,
  });

  const updateMutation = useMutation({
    mutationFn: ({ vendorCode, data }: { vendorCode: string; data: UpdateVendorRequest }) =>
      vendorService.update(vendorCode, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      setIsEditDialogOpen(false);
      setEditingVendor(null);
      resetEditFormData();
      toast.success("Vendor updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update vendor");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: vendorService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete vendor");
    },
  });

  const filteredAndSortedVendors = useMemo(() => {
    let filtered = vendors.filter(
      (vendor) =>
        vendor.vendorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.country.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }, [vendors, searchTerm, sortField, sortDirection]);

  const resetEditFormData = () => {
    setEditFormData({ name: "", address: "", city: "", country: "" });
  };

  const handleSort = (field: keyof Vendor) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field: keyof Vendor) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  const headerClass = (field: keyof Vendor) =>
    `cursor-pointer hover:bg-blue-800/30 text-blue-200 font-medium ${
      sortField === field ? "bg-blue-700/40" : ""
    }`;

  const openCreateWizard = () => {
    setIsCreateWizardOpen(true);
  };

  const openEditDialog = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setEditFormData({
      name: vendor.name,
      address: vendor.address,
      city: vendor.city,
      country: vendor.country,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingVendor) return;
    try {
      const updateRequest: UpdateVendorRequest = {
        name: editFormData.name.trim(),
        address: editFormData.address.trim(),
        city: editFormData.city.trim(),
        country: editFormData.country.trim(),
      };
      await updateMutation.mutateAsync({
        vendorCode: editingVendor.vendorCode,
        data: updateRequest,
      });
    } catch (error) {}
  };

  const handleDelete = async (vendorCode: string) => {
    try {
      await deleteMutation.mutateAsync(vendorCode);
    } catch (error) {}
  };

  if (isLoading) return <div className="p-6 text-blue-200">Loading vendors...</div>;
  if (error) return <div className="p-6 text-red-400">Error loading vendors</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Truck className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-blue-100">Vendor Management</h1>
            <p className="text-blue-300/80">Manage vendor information and relationships</p>
          </div>
        </div>
        <Button onClick={openCreateWizard} className="bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Vendor
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
          <Input
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-blue-950/50 border-blue-800 text-blue-100 placeholder-blue-400"
          />
        </div>
        <div className="text-sm text-blue-300">
          {filteredAndSortedVendors.length} of {vendors.length} vendors
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-blue-900/30 bg-blue-950/20 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-blue-900/30 hover:bg-blue-900/20">
              <TableHead className={headerClass("vendorCode")} onClick={() => handleSort("vendorCode")}>
                <div className="flex items-center">Vendor Code {renderSortIcon("vendorCode")}</div>
              </TableHead>
              <TableHead className={headerClass("name")} onClick={() => handleSort("name")}>
                <div className="flex items-center">Name {renderSortIcon("name")}</div>
              </TableHead>
              <TableHead className={headerClass("city")} onClick={() => handleSort("city")}>
                <div className="flex items-center">City {renderSortIcon("city")}</div>
              </TableHead>
              <TableHead className={headerClass("country")} onClick={() => handleSort("country")}>
                <div className="flex items-center">Country {renderSortIcon("country")}</div>
              </TableHead>
              <TableHead className="w-16 text-blue-200 font-medium text-center">Documents</TableHead>
              <TableHead className="w-16 text-blue-200 font-medium text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedVendors.map((vendor) => (
              <TableRow key={vendor.vendorCode} className="border-blue-900/30 hover:bg-blue-900/10">
                <TableCell className="font-mono text-blue-200">{vendor.vendorCode}</TableCell>
                <TableCell className="font-medium text-blue-100">{vendor.name}</TableCell>
                <TableCell className="text-blue-200">{vendor.city || "-"}</TableCell>
                <TableCell className="text-blue-200">{vendor.country || "-"}</TableCell>
                <TableCell className="text-center">
                  <Badge variant={vendor.documentsCount > 0 ? "secondary" : "outline"} className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    {vendor.documentsCount}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(vendor)}
                            disabled={vendor.documentsCount > 0}
                            className={`h-8 w-8 p-0 ${
                              vendor.documentsCount > 0
                                ? "opacity-50 cursor-not-allowed text-gray-400"
                                : "text-blue-400 hover:text-blue-300 hover:bg-blue-800/30"
                            }`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {vendor.documentsCount > 0 ? "Cannot edit: Vendor is used in documents" : "Edit vendor"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={vendor.documentsCount > 0}
                                  className={`h-8 w-8 p-0 ${
                                    vendor.documentsCount > 0
                                      ? "opacity-50 cursor-not-allowed text-gray-400"
                                      : "text-red-400 hover:text-red-300 hover:bg-red-800/30"
                                  }`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-gray-900 border-gray-700">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-red-400 flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5" />
                                    Confirm Deletion
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-gray-300">
                                    Are you sure you want to delete vendor "{vendor.name}" ({vendor.vendorCode})?
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="bg-gray-700 text-gray-200 hover:bg-gray-600">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(vendor.vendorCode)}
                                    className="bg-red-600 text-white hover:bg-red-700"
                                  >
                                    Delete Vendor
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          {vendor.documentsCount > 0 ? "Cannot delete: Vendor is used in documents" : "Delete vendor"}
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

      {/* Create Vendor Wizard */}
      <CreateVendorWizard
        isOpen={isCreateWizardOpen}
        onClose={() => setIsCreateWizardOpen(false)}
      />

      {/* Edit Vendor Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-blue-400 flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Vendor: {editingVendor?.vendorCode}
            </DialogTitle>
          </DialogHeader>
          {editingVendor && editingVendor.documentsCount > 0 && (
            <div className="p-3 bg-yellow-900/20 border border-yellow-500/30 rounded text-yellow-300 text-sm">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              This vendor is used in {editingVendor.documentsCount} document(s). Exercise caution when making changes.
            </div>
          )}
          <div className="space-y-4">
            <div>
              <Label className="text-blue-200">Vendor Code</Label>
              <Input value={editingVendor?.vendorCode || ""} disabled className="bg-gray-800 border-gray-600 text-gray-400" />
            </div>
            <div>
              <Label htmlFor="edit-name" className="text-blue-200">Vendor Name *</Label>
              <Input
                id="edit-name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="Enter vendor name"
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-address" className="text-blue-200">Address</Label>
              <Textarea
                id="edit-address"
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                placeholder="Enter vendor address"
                className="bg-gray-800 border-gray-600 text-white"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-city" className="text-blue-200">City</Label>
                <Input
                  id="edit-city"
                  value={editFormData.city}
                  onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                  placeholder="Enter city"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="edit-country" className="text-blue-200">Country</Label>
                <Input
                  id="edit-country"
                  value={editFormData.country}
                  onChange={(e) => setEditFormData({ ...editFormData, country: e.target.value })}
                  placeholder="Enter country"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={!editFormData.name || updateMutation.isPending}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {updateMutation.isPending ? "Updating..." : "Update Vendor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 