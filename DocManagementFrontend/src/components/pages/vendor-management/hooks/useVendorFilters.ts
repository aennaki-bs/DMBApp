import { useState, useMemo } from "react";
import { Vendor } from "@/models/vendor";

export function useVendorFilters(vendors: Vendor[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [countryFilter, setCountryFilter] = useState("any");
  const [filterOpen, setFilterOpen] = useState(false);

  // Get unique countries for filter
  const countries = useMemo(() => {
    const uniqueCountries = [
      ...new Set(vendors.map((v) => v.country).filter(Boolean)),
    ].sort();
    return [
      { id: "any", label: "Any Country", value: "any" },
      ...uniqueCountries.map((country) => ({
        id: country,
        label: country,
        value: country,
      })),
    ];
  }, [vendors]);

  // Filter and search logic
  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const searchIn = {
          all: `${vendor.vendorCode} ${vendor.name} ${vendor.city || ""} ${
            vendor.country || ""
          } ${vendor.address || ""}`.toLowerCase(),
          vendorCode: vendor.vendorCode.toLowerCase(),
          name: vendor.name.toLowerCase(),
          city: (vendor.city || "").toLowerCase(),
          country: (vendor.country || "").toLowerCase(),
          address: (vendor.address || "").toLowerCase(),
        };

        if (!searchIn[searchField as keyof typeof searchIn]?.includes(query)) {
          return false;
        }
      }

      // Country filter
      if (countryFilter !== "any" && vendor.country !== countryFilter) {
        return false;
      }

      return true;
    });
  }, [vendors, searchQuery, searchField, countryFilter]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSearchField("all");
    setCountryFilter("any");
    setFilterOpen(false);
  };

  return {
    searchQuery,
    setSearchQuery,
    searchField,
    setSearchField,
    countryFilter,
    setCountryFilter,
    filterOpen,
    setFilterOpen,
    clearAllFilters,
    filteredVendors,
    countries,
  };
} 