import { useState, useMemo } from "react";
import { Vendor } from "@/models/vendor";

export function useVendorSelection() {
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);

  const handleSelectVendor = (vendorCode: string, checked: boolean) => {
    if (checked) {
      setSelectedVendors([...selectedVendors, vendorCode]);
    } else {
      setSelectedVendors(selectedVendors.filter((code) => code !== vendorCode));
    }
  };

  const handleSelectAll = (paginatedVendors: Vendor[]) => {
    const currentPageVendorCodes = paginatedVendors.map(
      (vendor) => vendor.vendorCode
    );
    const allCurrentSelected = currentPageVendorCodes.every((code) =>
      selectedVendors.includes(code)
    );

    if (allCurrentSelected) {
      setSelectedVendors(
        selectedVendors.filter((code) => !currentPageVendorCodes.includes(code))
      );
    } else {
      const newSelected = [...selectedVendors];
      currentPageVendorCodes.forEach((code) => {
        if (!newSelected.includes(code)) {
          newSelected.push(code);
        }
      });
      setSelectedVendors(newSelected);
    }
  };

  const getSelectionState = (paginatedVendors: Vendor[]) => {
    const isAllSelected =
      paginatedVendors.length > 0 &&
      paginatedVendors.every((vendor) =>
        selectedVendors.includes(vendor.vendorCode)
      );
    
    const isIndeterminate =
      selectedVendors.length > 0 &&
      !isAllSelected &&
      paginatedVendors.some((vendor) =>
        selectedVendors.includes(vendor.vendorCode)
      );

    return { isAllSelected, isIndeterminate };
  };

  const selectedPercentage = useMemo(() => {
    return selectedVendors.length > 0 ? Math.round((selectedVendors.length / 100) * 100) : 0;
  }, [selectedVendors.length]);

  return {
    selectedVendors,
    setSelectedVendors,
    handleSelectVendor,
    handleSelectAll,
    getSelectionState,
    selectedPercentage,
    // Backward compatibility
    isAllSelected: false, // Will be calculated per page
    isIndeterminate: false, // Will be calculated per page
  };
} 