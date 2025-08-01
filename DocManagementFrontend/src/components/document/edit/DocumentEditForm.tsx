import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Save, Archive, AlertTriangle, Building2, UserCheck, Package } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Document,
  DocumentType,
  UpdateDocumentRequest,
  TierType,
} from "@/models/document";
import customerService from "@/services/customerService";
import vendorService from "@/services/vendorService";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, Search } from "lucide-react";

interface DocumentEditFormProps {
  document: Document | null;
  documentTypes: DocumentType[];
  isLoading: boolean;
  isSubmitting: boolean;
  onSubmit: (documentData: UpdateDocumentRequest) => Promise<void>;
  onCancel: () => void;
}

const DocumentEditForm = ({
  document,
  documentTypes,
  isLoading,
  isSubmitting,
  onSubmit,
  onCancel,
}: DocumentEditFormProps) => {
  const { t, tWithParams } = useTranslation();
  
  // Form data
  const [title, setTitle] = useState("");
  const [accountingDate, setAccountingDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [content, setContent] = useState("");
  const [documentExterne, setDocumentExterne] = useState("");

  // Customer/Vendor data
  const [selectedCustomerVendor, setSelectedCustomerVendor] = useState<any>(null);
  const [customerVendorName, setCustomerVendorName] = useState("");
  const [customerVendorAddress, setCustomerVendorAddress] = useState("");
  const [customerVendorCity, setCustomerVendorCity] = useState("");
  const [customerVendorCountry, setCustomerVendorCountry] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [isLoadingCustomerVendor, setIsLoadingCustomerVendor] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Track which fields have been edited
  const [editedFields, setEditedFields] = useState<Record<string, boolean>>({
    title: false,
    accountingDate: false,
    content: false,
    documentExterne: false,
    customerVendorName: false,
    customerVendorAddress: false,
    customerVendorCity: false,
    customerVendorCountry: false,
  });

  // Get document type to determine if customer/vendor is needed
  const documentType = documentTypes.find(dt => dt.id === document?.typeId);
  const tierType = documentType?.tierType;
  const shouldShowCustomerVendor = tierType === TierType.Customer || tierType === TierType.Vendor;

  // Helper functions
  const getTierTypeString = (type: TierType): string => {
    switch (type) {
      case TierType.Customer:
        return t('documents.customer');
      case TierType.Vendor:
        return t('documents.vendor');
      default:
        return "none";
    }
  };

  const getCodeProperty = (item: any, tierType: TierType): string => {
    return tierType === TierType.Customer ? item.code : item.vendorCode;
  };

  const getTierTypeIcon = () => {
    switch (tierType) {
      case TierType.Customer:
        return <UserCheck className="h-4 w-4 text-green-400" />;
      case TierType.Vendor:
        return <Package className="h-4 w-4 text-orange-400" />;
      default:
        return <Building2 className="h-4 w-4 text-gray-400" />;
    }
  };

  // Fetch customers or vendors based on tierType
  useEffect(() => {
    const fetchCustomerVendorData = async () => {
      if (!shouldShowCustomerVendor) return;

      setIsLoadingCustomerVendor(true);
      try {
        if (tierType === TierType.Customer) {
          const customerData = await customerService.getAll();
          setCustomers(customerData);
        } else if (tierType === TierType.Vendor) {
          const vendorData = await vendorService.getAll();
          setVendors(vendorData);
        }
      } catch (error) {
        const tierTypeString = getTierTypeString(tierType!);
        console.error(`Failed to fetch ${tierTypeString}s:`, error);
        toast.error(`Failed to load ${tierTypeString}s`);
      } finally {
        setIsLoadingCustomerVendor(false);
      }
    };

    fetchCustomerVendorData();
  }, [shouldShowCustomerVendor, tierType]);

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    const dataSource = tierType === TierType.Customer ? customers : vendors;
    
    if (!searchQuery) {
      return dataSource;
    }
    
    return dataSource.filter(item => 
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCodeProperty(item, tierType!).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, vendors, searchQuery, tierType]);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
      // Set accounting date from the document's comptableDate
      console.log("Document comptableDate:", document.comptableDate);
      // Parse the date and format it for the input field
      const date = new Date(document.comptableDate);
      // Use local date to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;
      console.log("Formatted accounting date for input:", formattedDate);
      setAccountingDate(formattedDate);
      setContent(document.content);
      setDocumentExterne(document.documentExterne || "");

      // Set customer/vendor data
      setCustomerVendorName(document.customerVendorName || "");
      setCustomerVendorAddress(document.customerVendorAddress || "");
      setCustomerVendorCity(document.customerVendorCity || "");
      setCustomerVendorCountry(document.customerVendorCountry || "");

      // Try to find the selected customer/vendor based on the code
      if (document.customerVendorCode && shouldShowCustomerVendor) {
        const dataSource = tierType === TierType.Customer ? customers : vendors;
        const foundCustomerVendor = dataSource.find(item => 
          getCodeProperty(item, tierType!) === document.customerVendorCode
        );
        if (foundCustomerVendor) {
          setSelectedCustomerVendor(foundCustomerVendor);
        }
      }

      // Reset edited fields when document changes
      setEditedFields({
        title: false,
        accountingDate: false,
        content: false,
        documentExterne: false,
        customerVendorName: false,
        customerVendorAddress: false,
        customerVendorCity: false,
        customerVendorCountry: false,
      });
    }
  }, [document, customers, vendors, shouldShowCustomerVendor, tierType]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setTitle(newValue);
    setEditedFields({ ...editedFields, title: newValue !== document?.title });
  };

  const handleAccountingDateChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    setAccountingDate(newValue);

    // Format original date the same way for comparison
    let originalDate = "";
    if (document?.comptableDate) {
      const date = new Date(document.comptableDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      originalDate = `${year}-${month}-${day}`;
    }

    console.log("Comparing dates - new:", newValue, "original:", originalDate);
    setEditedFields({
      ...editedFields,
      accountingDate: newValue !== originalDate,
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    setEditedFields({
      ...editedFields,
      content: newValue !== document?.content,
    });
  };

  const handleDocumentExterneChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = e.target.value;
    setDocumentExterne(newValue);
    setEditedFields({
      ...editedFields,
      documentExterne: newValue !== document?.documentExterne,
    });
  };

  // Customer/Vendor handlers
  const handleCustomerVendorSelect = (value: string) => {
    const dataSource = tierType === TierType.Customer ? customers : vendors;
    const selected = dataSource.find(item => getCodeProperty(item, tierType!) === value);
    
    setSelectedCustomerVendor(selected);
    
    if (selected) {
      const newName = selected.name || "";
      const newAddress = selected.address || "";
      const newCity = selected.city || "";
      const newCountry = selected.country || "";
      
      setCustomerVendorName(newName);
      setCustomerVendorAddress(newAddress);
      setCustomerVendorCity(newCity);
      setCustomerVendorCountry(newCountry);
      
      // Mark fields as edited if they are different from the original document
      setEditedFields({
        ...editedFields,
        customerVendorName: newName !== (document?.customerVendorName || ""),
        customerVendorAddress: newAddress !== (document?.customerVendorAddress || ""),
        customerVendorCity: newCity !== (document?.customerVendorCity || ""),
        customerVendorCountry: newCountry !== (document?.customerVendorCountry || ""),
      });
    }
    
    setSearchQuery("");
    setOpen(false);
  };

  const handleCustomerVendorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomerVendorName(newValue);
    setEditedFields({
      ...editedFields,
      customerVendorName: newValue !== document?.customerVendorName,
    });
  };

  const handleCustomerVendorAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomerVendorAddress(newValue);
    setEditedFields({
      ...editedFields,
      customerVendorAddress: newValue !== document?.customerVendorAddress,
    });
  };

  const handleCustomerVendorCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomerVendorCity(newValue);
    setEditedFields({
      ...editedFields,
      customerVendorCity: newValue !== document?.customerVendorCity,
    });
  };

  const handleCustomerVendorCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setCustomerVendorCountry(newValue);
    setEditedFields({
      ...editedFields,
      customerVendorCountry: newValue !== document?.customerVendorCountry,
    });
  };

  const validateForm = () => {
    if (!Object.values(editedFields).some((edited) => edited)) {
      toast.info(t('documents.noChangesDetected'));
      return false;
    }

    if (editedFields.title && !title.trim()) {
      toast.error(t('documents.pleaseEnterDocumentTitle'));
      return false;
    }
    if (editedFields.accountingDate && !accountingDate) {
      toast.error(t('documents.pleaseSelectAccountingDate'));
      return false;
    }
    if (editedFields.content && !content.trim()) {
      toast.error(t('documents.pleaseEnterDocumentContent'));
      return false;
    }
    
    // Validate customer/vendor if it's being edited
    if (shouldShowCustomerVendor && editedFields.customerVendorName && !customerVendorName.trim()) {
      toast.error(tierType === TierType.Customer 
        ? t('documents.pleaseEnterCustomerName')
        : t('documents.pleaseEnterVendorName')
      );
      return false;
    }
    
    return true;
  };

  // Helper function to check if only customer/vendor fields were edited
  const hasOnlyCustomerVendorChanges = () => {
    const customerVendorFieldKeys = ['customerVendorName', 'customerVendorAddress', 'customerVendorCity', 'customerVendorCountry'];
    const editedKeys = Object.keys(editedFields).filter(key => editedFields[key]);
    return editedKeys.length > 0 && editedKeys.every(key => customerVendorFieldKeys.includes(key));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Only include fields that have been edited
    const documentData: UpdateDocumentRequest = {};

    if (editedFields.title) documentData.title = title;
    if (editedFields.accountingDate) {
      // Convert the date string to ISO format for the backend
      // Create date at noon UTC to avoid timezone issues
      const dateToSend = new Date(
        accountingDate + "T12:00:00.000Z"
      ).toISOString();
      console.log(
        "Sending accounting date:",
        accountingDate,
        "as ISO:",
        dateToSend
      );
      documentData.comptableDate = dateToSend;
    }
    if (editedFields.content) documentData.content = content;
    if (editedFields.documentExterne)
      documentData.documentExterne = documentExterne;

    // Include customer/vendor data if any field was edited
    if (shouldShowCustomerVendor) {
      if (editedFields.customerVendorName) documentData.customerVendorName = customerVendorName;
      if (editedFields.customerVendorAddress) documentData.customerVendorAddress = customerVendorAddress;
      if (editedFields.customerVendorCity) documentData.customerVendorCity = customerVendorCity;
      if (editedFields.customerVendorCountry) documentData.customerVendorCountry = customerVendorCountry;
      
      // Include the customer/vendor code if a selection was made
      if (selectedCustomerVendor && (editedFields.customerVendorName || editedFields.customerVendorAddress || editedFields.customerVendorCity || editedFields.customerVendorCountry)) {
        documentData.customerVendorCode = getCodeProperty(selectedCustomerVendor, tierType!);
      }
    }

    console.log("Submitting document data:", documentData);
    await onSubmit(documentData);
  };

  if (isLoading) {
    return (
      <Card className="animate-pulse bg-[#0a1033] border border-blue-900/30">
        <CardContent className="p-6 space-y-6">
          <div className="h-12 bg-[#111633] rounded"></div>
          <div className="h-12 bg-[#111633] rounded"></div>
          <div className="h-12 bg-[#111633] rounded"></div>
          <div className="h-40 bg-[#111633] rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!document) {
    return (
      <Card className="bg-[#0a1033] border border-blue-900/30 shadow-lg">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-gray-400">
            {t('documents.documentNotFound')}
          </p>
          <Button
            onClick={onCancel}
            className="mt-4"
            variant="outline"
            size="lg"
          >
            {t('documents.backToDocuments')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isArchived = document.isArchived || false;

  return (
    <Card className="bg-[#0a1033] border border-blue-900/30 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-white">
          {t('documents.editDocumentDetails')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isArchived && (
          <Alert className="mb-6 bg-orange-900/20 border-orange-700/30 text-orange-200">
            <Archive className="h-4 w-4" />
            <AlertDescription>
              {document.erpDocumentCode 
                ? tWithParams('documents.documentArchivedWithCode', { code: document.erpDocumentCode })
                : t('documents.documentArchived')
              }
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-6">
          <div className="space-y-3">
            <Label
              htmlFor="title"
              className="text-base font-medium text-blue-100"
            >
              {t('documents.documentTitle')}*
            </Label>
            <Input
              id="title"
              value={title}
              onChange={handleTitleChange}
              placeholder={t('documents.enterDocumentTitle')}
              className="h-12 text-base bg-[#111633] border-blue-900/30 text-white"
              disabled={isArchived}
            />
            {editedFields.title && (
              <p className="text-xs text-blue-400">
                ℹ️ {t('documents.titleModified')}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="accountingDate"
              className="text-base font-medium text-blue-100"
            >
              {t('documents.postingDate')}*
            </Label>
            <Input
              id="accountingDate"
              type="date"
              value={accountingDate}
              onChange={handleAccountingDateChange}
              className="h-12 text-base bg-[#111633] border-blue-900/30 text-white"
              disabled={isArchived}
            />
            {editedFields.accountingDate && (
              <p className="text-xs text-blue-400">
                ℹ️ {t('documents.postingDateModified')}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="content"
              className="text-base font-medium text-blue-100"
            >
              {t('documents.documentContent')}*
            </Label>
            <Textarea
              id="content"
              value={content}
              onChange={handleContentChange}
              placeholder={t('documents.enterDocumentContent')}
              rows={10}
              className="text-base resize-y bg-[#111633] border-blue-900/30 text-white"
              disabled={isArchived}
            />
            {editedFields.content && (
              <p className="text-xs text-blue-400">
                ℹ️ {t('documents.contentModified')}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Label
              htmlFor="documentExterne"
              className="text-base font-medium text-blue-100"
            >
              {t('documents.documentExterne')}
            </Label>
            <Input
              id="documentExterne"
              value={documentExterne}
              onChange={handleDocumentExterneChange}
              placeholder={t('documents.enterDocumentExterne')}
              className="h-12 text-base bg-[#111633] border-blue-900/30 text-white"
              disabled={isArchived}
            />
            {editedFields.documentExterne && (
              <p className="text-xs text-blue-400">
                ℹ️ {t('documents.documentExterneModified')}
              </p>
            )}
          </div>

          {shouldShowCustomerVendor && (
            <div className="space-y-3">
                                                          <Label
                  htmlFor="customerVendor"
                  className="text-base font-medium text-blue-100 flex items-center gap-2"
                >
                  {getTierTypeIcon()} {tierType === TierType.Customer ? t('documents.customer') : t('documents.vendor')}*
                </Label>
                             <Popover open={open} onOpenChange={setOpen}>
                 <PopoverTrigger asChild>
                   <Button
                     variant="outline"
                     role="combobox"
                     aria-expanded={open}
                     disabled={isLoadingCustomerVendor}
                     className={cn(
                       "w-full h-12 justify-between bg-[#111633] border-blue-900/30 text-white hover:bg-[#1a1f3a]",
                       !selectedCustomerVendor && !customerVendorName && "text-gray-400"
                     )}
                   >
                     {selectedCustomerVendor ? (
                       <div className="flex items-center gap-2">
                         <span className="font-mono text-xs text-blue-300">
                           {getCodeProperty(selectedCustomerVendor, tierType!)}
                         </span>
                         <span>{selectedCustomerVendor.name}</span>
                       </div>
                     ) : customerVendorName ? (
                       <span>{customerVendorName}</span>
                                           ) : isLoadingCustomerVendor ? (
                        tWithParams('documents.loadingItems', { type: getTierTypeString(tierType!) })
                      ) : (
                        tWithParams('documents.selectItem', { type: getTierTypeString(tierType!) })
                      )}
                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                   </Button>
                 </PopoverTrigger>
                                 <PopoverContent className="w-full p-0 bg-[#111633] border-blue-900/30">
                   <div className="p-2">
                                           <input
                        type="text"
                        placeholder={tWithParams('documents.searchItems', { type: getTierTypeString(tierType!) })}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-3 py-2 bg-[#111633] border border-blue-900/30 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                   </div>
                   <div className="max-h-[200px] overflow-y-auto">
                                           {filteredItems.length === 0 ? (
                        <div className="p-2 text-gray-400 text-center">{tWithParams('documents.noItemsFound', { type: getTierTypeString(tierType!) })}</div>
                      ) : (
                       filteredItems.map((item) => {
                         const itemCode = getCodeProperty(item, tierType!);
                         const isSelected = selectedCustomerVendor && getCodeProperty(selectedCustomerVendor, tierType!) === itemCode;
                         
                         return (
                           <div
                             key={itemCode}
                             onClick={() => handleCustomerVendorSelect(itemCode)}
                             className="flex items-center justify-between p-2 text-white hover:bg-blue-900/30 cursor-pointer border-b border-blue-900/20 last:border-b-0"
                           >
                             <div className="flex items-center gap-2">
                               <Check
                                 className={cn(
                                   "h-4 w-4",
                                   isSelected ? "opacity-100" : "opacity-0"
                                 )}
                               />
                               <span>{item.name}</span>
                             </div>
                             <span className="text-xs text-blue-400">{itemCode}</span>
                           </div>
                         );
                       })
                     )}
                   </div>
                 </PopoverContent>
              </Popover>
                           </div>
           )}

          {shouldShowCustomerVendor && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="space-y-3">
                                   <Label
                    htmlFor="customerVendorName"
                    className="text-base font-medium text-blue-100"
                  >
                    {tierType === TierType.Customer ? t('documents.customerName') : t('documents.vendorName')}*
                  </Label>
                 <Input
                   id="customerVendorName"
                   value={customerVendorName}
                   onChange={handleCustomerVendorNameChange}
                   placeholder={t('documents.enterName')}
                   className="h-12 text-base bg-[#111633] border-blue-900/30 text-white"
                 />
                 {editedFields.customerVendorName && (
                   <p className="text-xs text-blue-400">
                     ℹ️ {tierType === TierType.Customer ? t('documents.customerNameModified') : t('documents.vendorNameModified')}
                   </p>
                 )}
               </div>

                             <div className="space-y-3">
                 <Label
                   htmlFor="customerVendorCity"
                   className="text-base font-medium text-blue-100"
                 >
                   {t('documents.city')}
                 </Label>
                 <Input
                   id="customerVendorCity"
                   value={customerVendorCity}
                   onChange={handleCustomerVendorCityChange}
                   placeholder={t('documents.enterCity')}
                   className="h-12 text-base bg-[#111633] border-blue-900/30 text-white"
                 />
                 {editedFields.customerVendorCity && (
                   <p className="text-xs text-blue-400">
                     ℹ️ {t('documents.cityModified')}
                   </p>
                 )}
               </div>

                             <div className="space-y-3">
                 <Label
                   htmlFor="customerVendorAddress"
                   className="text-base font-medium text-blue-100"
                 >
                   {t('documents.address')}
                 </Label>
                 <Input
                   id="customerVendorAddress"
                   value={customerVendorAddress}
                   onChange={handleCustomerVendorAddressChange}
                   placeholder={t('documents.enterAddress')}
                   className="h-12 text-base bg-[#111633] border-blue-900/30 text-white"
                 />
                 {editedFields.customerVendorAddress && (
                   <p className="text-xs text-blue-400">
                     ℹ️ {t('documents.addressModified')}
                   </p>
                 )}
               </div>

                             <div className="space-y-3">
                 <Label
                   htmlFor="customerVendorCountry"
                   className="text-base font-medium text-blue-100"
                 >
                   {t('documents.country')}
                 </Label>
                 <Input
                   id="customerVendorCountry"
                   value={customerVendorCountry}
                   onChange={handleCustomerVendorCountryChange}
                   placeholder={t('documents.enterCountry')}
                   className="h-12 text-base bg-[#111633] border-blue-900/30 text-white"
                 />
                 {editedFields.customerVendorCountry && (
                   <p className="text-xs text-blue-400">
                     ℹ️ {t('documents.countryModified')}
                   </p>
                 )}
               </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 pt-6">
            <Button
              variant="outline"
              size="lg"
              onClick={onCancel}
              className="px-6 border-blue-900/30 text-white hover:bg-blue-900/20"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting ||
                !Object.values(editedFields).some((edited) => edited) ||
                (isArchived && !hasOnlyCustomerVendorChanges())
              }
              size="lg"
              className={`px-6 ${
                (isArchived && !hasOnlyCustomerVendorChanges())
                  ? "bg-gray-600/50 hover:bg-gray-700/50 cursor-not-allowed"
                  : Object.values(editedFields).some((edited) => edited)
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600/50 hover:bg-blue-700/50 cursor-not-allowed"
              }`}
            >
              <Save className="mr-2 h-5 w-5" />
              {(isArchived && !hasOnlyCustomerVendorChanges()) ? t('documents.documentArchivedButton') : isSubmitting ? t('documents.saving') : t('documents.saveChanges')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentEditForm;
