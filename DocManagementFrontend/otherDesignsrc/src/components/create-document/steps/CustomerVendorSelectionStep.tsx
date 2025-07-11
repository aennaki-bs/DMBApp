import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  UserCheck,
  Package,
  ChevronDown,
  Search,
  X,
} from "lucide-react";
import { DocumentType, TierType } from "@/models/document";
import customerService from "@/services/customerService";
import vendorService from "@/services/vendorService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

interface CustomerVendorSelectionStepProps {
  selectedTypeId: number | null;
  documentTypes: DocumentType[];
  selectedCustomerVendor: any;
  customerVendorName: string;
  customerVendorAddress: string;
  customerVendorCity: string;
  customerVendorCountry: string;
  onCustomerVendorSelect: (customerVendor: any) => void;
  onNameChange: (name: string) => void;
  onAddressChange: (address: string) => void;
  onCityChange: (city: string) => void;
  onCountryChange: (country: string) => void;
}

export const CustomerVendorSelectionStep = ({
  selectedTypeId,
  documentTypes,
  selectedCustomerVendor,
  customerVendorName,
  customerVendorAddress,
  customerVendorCity,
  customerVendorCountry,
  onCustomerVendorSelect,
  onNameChange,
  onAddressChange,
  onCityChange,
  onCountryChange,
}: CustomerVendorSelectionStepProps) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedType = documentTypes.find((t) => t.id === selectedTypeId);
  const tierType = selectedType?.tierType;
  const isCustomer = tierType === TierType.Customer;
  const itemType = isCustomer ? "customer" : "vendor";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!tierType || tierType === TierType.None) return;

      setIsLoading(true);
      try {
        let data = [];
        if (isCustomer) {
          data = await customerService.getAll();
        } else {
          data = await vendorService.getAll();
        }
        setItems(data || []);
      } catch (error) {
        console.error(`Failed to fetch ${itemType}s:`, error);
        toast.error(`Failed to load ${itemType}s`);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tierType, isCustomer, itemType]);

  // Filter items based on search
  const filteredItems = items.filter((item) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    const code = isCustomer ? item.code : item.vendorCode;
    return (
      item.name?.toLowerCase().includes(search) ||
      code?.toLowerCase().includes(search)
    );
  });

  // Handle selection
  const handleSelect = (item: any) => {
    onCustomerVendorSelect(item);
    onNameChange(item.name || "");
    onAddressChange(item.address || "");
    onCityChange(item.city || "");
    onCountryChange(item.country || "");
    setIsOpen(false);
    setSearchQuery("");
  };

  // Get display value
  const getDisplayValue = () => {
    if (selectedCustomerVendor) {
      const code = isCustomer
        ? selectedCustomerVendor.code
        : selectedCustomerVendor.vendorCode;
      return `${code} - ${selectedCustomerVendor.name}`;
    }
    return `Select a ${itemType}`;
  };

  // If no customer/vendor needed
  if (!tierType || tierType === TierType.None) {
    return (
      <Card className="bg-[#1e2a4a] border-blue-900/40">
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Building2 className="mx-auto h-12 w-12 text-blue-400 mb-4" />
            <h3 className="text-lg font-medium text-blue-100 mb-2">
              No Customer/Vendor Required
            </h3>
            <p className="text-blue-300/70">
              This document type doesn't require customer or vendor selection.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-[#1e2a4a] border-blue-900/40">
      <CardHeader>
        <div className="flex items-center gap-3">
          {isCustomer ? (
            <UserCheck className="h-6 w-6 text-green-400" />
          ) : (
            <Package className="h-6 w-6 text-orange-400" />
          )}
          <div>
            <CardTitle className="text-blue-100">
              Select {isCustomer ? "Customer" : "Vendor"}
            </CardTitle>
            <p className="text-sm text-blue-300/70 mt-1">
              Choose a {itemType} and review their information
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Custom Select Dropdown */}
        <div className="space-y-2">
          <Label className="text-blue-200 capitalize">{itemType} *</Label>

          <div className="relative" ref={dropdownRef}>
            {/* Select Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(!isOpen)}
              disabled={isLoading}
              className={cn(
                "w-full justify-between bg-[#111633] border-blue-900/40 text-white hover:bg-[#1a1f3a]",
                !selectedCustomerVendor && "text-gray-400"
              )}
            >
              <span className="truncate">{getDisplayValue()}</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-180"
                )}
              />
            </Button>

            {/* Dropdown */}
            {isOpen && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-[#111633] border border-blue-900/40 rounded-md shadow-lg">
                {/* Search Input */}
                <div className="p-3 border-b border-blue-900/40">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder={`Search ${itemType}s...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-10 bg-[#1a1f3a] border-blue-900/40 text-white placeholder:text-gray-400"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Items List */}
                <div className="max-h-[200px] overflow-y-auto">
                  {isLoading ? (
                    <div className="p-4 text-center text-gray-400">
                      <div className="inline-flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                        Loading {itemType}s...
                      </div>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="p-4 text-center text-gray-400">
                      {searchQuery
                        ? `No ${itemType}s found matching "${searchQuery}"`
                        : `No ${itemType}s available`}
                    </div>
                  ) : (
                    filteredItems.map((item) => {
                      const code = isCustomer ? item.code : item.vendorCode;
                      const isSelected =
                        selectedCustomerVendor &&
                        (isCustomer
                          ? selectedCustomerVendor.code
                          : selectedCustomerVendor.vendorCode) === code;

                      return (
                        <div
                          key={code}
                          onClick={() => handleSelect(item)}
                          className={cn(
                            "p-3 cursor-pointer border-b border-blue-900/20 last:border-b-0 transition-colors",
                            "hover:bg-blue-900/30",
                            isSelected && "bg-blue-900/40"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-blue-300">
                              {code}
                            </span>
                            <span className="text-white">{item.name}</span>
                          </div>
                          {item.city && (
                            <div className="text-xs text-gray-400 mt-1">
                              {item.city}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Results Counter */}
                {!isLoading && (
                  <div className="p-2 border-t border-blue-900/40 text-xs text-gray-400 text-center">
                    {searchQuery
                      ? `${filteredItems.length} of ${items.length} ${itemType}s found`
                      : `${items.length} ${itemType}s available`}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-blue-200">Name *</Label>
            <Input
              value={customerVendorName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter name"
              className="bg-[#111633] border-blue-900/40 text-white placeholder:text-gray-400"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-blue-200">City</Label>
            <Input
              value={customerVendorCity}
              onChange={(e) => onCityChange(e.target.value)}
              placeholder="Enter city"
              className="bg-[#111633] border-blue-900/40 text-white placeholder:text-gray-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-blue-200">Address</Label>
          <Input
            value={customerVendorAddress}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Enter address"
            className="bg-[#111633] border-blue-900/40 text-white placeholder:text-gray-400"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-blue-200">Country</Label>
          <Input
            value={customerVendorCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            placeholder="Enter country"
            className="bg-[#111633] border-blue-900/40 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Selected Item Info */}
        {selectedCustomerVendor && (
          <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-800/40">
            <h4 className="text-sm font-medium text-blue-200 mb-2">
              Selected {isCustomer ? "Customer" : "Vendor"}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-blue-400">Code:</span>
                <span className="text-white ml-2 font-mono">
                  {isCustomer
                    ? selectedCustomerVendor.code
                    : selectedCustomerVendor.vendorCode}
                </span>
              </div>
              <div>
                <span className="text-blue-400">Name:</span>
                <span className="text-white ml-2">
                  {selectedCustomerVendor.name}
                </span>
              </div>
            </div>
            <p className="text-xs text-blue-300/70 mt-2">
              You can modify the information above if needed for this document.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
