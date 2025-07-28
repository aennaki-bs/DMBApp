import React, { useState, useMemo } from 'react';
import { Search, X, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Ligne } from '@/models/document';

interface SimpleLigneFiltersProps {
  lignes: Ligne[];
  onFiltersChange: (filteredData: Ligne[]) => void;
  className?: string;
}

export function SimpleLigneFilters({ 
  lignes, 
  onFiltersChange, 
  className = '' 
}: SimpleLigneFiltersProps) {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('all');
  
  // Filter state
  const [quantityFilter, setQuantityFilter] = useState('any');
  const [priceFilter, setPriceFilter] = useState('any');
  const [amountFilter, setAmountFilter] = useState('any');
  const [discountFilter, setDiscountFilter] = useState('any');
  
  const [filterOpen, setFilterOpen] = useState(false);

  // Search fields configuration
  const searchFields = [
    { id: 'all', label: 'All fields' },
    { id: 'title', label: 'Title' },
    { id: 'article', label: 'Items' },
    { id: 'itemCode', label: 'Item Code' },
    { id: 'generalAccountsCode', label: 'Account Code' },
  ];

  // Filter options
  const quantityOptions = [
    { value: 'any', label: 'Any quantity' },
    { value: 'low', label: '< 5' },
    { value: 'medium', label: '5-20' },
    { value: 'high', label: '> 20' },
  ];

  const priceOptions = [
    { value: 'any', label: 'Any price' },
    { value: 'low', label: '< 100 MAD' },
    { value: 'medium', label: '100-500 MAD' },
    { value: 'high', label: '> 500 MAD' },
  ];

  const amountOptions = [
    { value: 'any', label: 'Any amount' },
    { value: 'low', label: '< 500 MAD' },
    { value: 'medium', label: '500-2000 MAD' },
    { value: 'high', label: '> 2000 MAD' },
  ];

  const discountOptions = [
    { value: 'any', label: 'Any discount' },
    { value: 'none', label: 'No discount' },
    { value: 'low', label: '< 10%' },
    { value: 'medium', label: '10-25%' },
    { value: 'high', label: '> 25%' },
  ];

  // Apply filters
  const filteredData = useMemo(() => {
    return lignes.filter(ligne => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        
        if (searchField === 'all') {
          const searchableFields = [
            ligne.title,
            ligne.article,
            ligne.itemCode,
            ligne.generalAccountsCode,
          ];
          if (!searchableFields.some(field => 
            field && String(field).toLowerCase().includes(query)
          )) {
            return false;
          }
        } else {
          const value = ligne[searchField as keyof Ligne];
          if (!value || !String(value).toLowerCase().includes(query)) {
            return false;
          }
        }
      }

      // Quantity filter
      if (quantityFilter !== 'any') {
        const qty = ligne.quantity || 0;
        switch (quantityFilter) {
          case 'low': if (qty >= 5) return false; break;
          case 'medium': if (qty < 5 || qty > 20) return false; break;
          case 'high': if (qty <= 20) return false; break;
        }
      }

      // Price filter
      if (priceFilter !== 'any') {
        const price = ligne.priceHT || 0;
        switch (priceFilter) {
          case 'low': if (price >= 100) return false; break;
          case 'medium': if (price < 100 || price > 500) return false; break;
          case 'high': if (price <= 500) return false; break;
        }
      }

      // Amount filter
      if (amountFilter !== 'any') {
        const amount = ligne.amountTTC || 0;
        switch (amountFilter) {
          case 'low': if (amount >= 500) return false; break;
          case 'medium': if (amount < 500 || amount > 2000) return false; break;
          case 'high': if (amount <= 2000) return false; break;
        }
      }

      // Discount filter
      if (discountFilter !== 'any') {
        const discount = ligne.discountPercentage || 0;
        switch (discountFilter) {
          case 'none': if (discount > 0) return false; break;
          case 'low': if (discount === 0 || discount >= 10) return false; break;
          case 'medium': if (discount < 10 || discount > 25) return false; break;
          case 'high': if (discount <= 25) return false; break;
        }
      }

      return true;
    });
  }, [lignes, searchQuery, searchField, quantityFilter, priceFilter, amountFilter, discountFilter]);

  // Notify parent of changes
  React.useEffect(() => {
    onFiltersChange(filteredData);
  }, [filteredData, onFiltersChange]);

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSearchField('all');
    setQuantityFilter('any');
    setPriceFilter('any');
    setAmountFilter('any');
    setDiscountFilter('any');
    setFilterOpen(false);
  };

  // Check if any filters are active
  const hasActiveFilters = 
    searchQuery.trim() !== '' ||
    searchField !== 'all' ||
    quantityFilter !== 'any' ||
    priceFilter !== 'any' ||
    amountFilter !== 'any' ||
    discountFilter !== 'any';

  const activeFilterCount = [
    searchQuery.trim() !== '',
    quantityFilter !== 'any',
    priceFilter !== 'any',
    amountFilter !== 'any',
    discountFilter !== 'any',
  ].filter(Boolean).length;

  const selectedField = searchFields.find(f => f.id === searchField);
  const placeholder = `Search lines... ${selectedField?.label?.toLowerCase()}...`;

  return (
    <div className={`w-full ${className}`}>
      {/* Main Search Bar - matching the image design */}
      <div className="flex items-center gap-0 rounded-lg overflow-hidden bg-slate-800/90 backdrop-blur-sm shadow-lg border border-slate-700/50">
        {/* Field Selector - Left */}
        <Select value={searchField} onValueChange={setSearchField}>
          <SelectTrigger className="w-[140px] bg-slate-900/70 text-slate-200 border-0 border-r border-slate-600/50 rounded-none focus:ring-0 focus:ring-offset-0 hover:bg-slate-800/80 transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 text-slate-200 border border-slate-600">
            {searchFields.map((field) => (
              <SelectItem
                key={field.id}
                value={field.id}
                className="hover:bg-slate-700 focus:bg-slate-700"
              >
                {field.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search Input - Center */}
        <div className="relative flex-1">
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-slate-200 border-0 pl-10 pr-8 h-11 focus:ring-0 focus:ring-offset-0 placeholder:text-slate-400"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Button - Right */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className="bg-slate-900/70 text-slate-200 border-0 border-l border-slate-600/50 rounded-none px-4 h-11 hover:bg-slate-800/80 transition-colors relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter Lines
              {activeFilterCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-blue-500 text-white border-0 rounded-full"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-slate-800 border border-slate-600 rounded-lg shadow-xl p-4" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-200">Filter Options</h4>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                {/* Quantity Filter */}
                <div>
                  <Label className="text-sm font-medium text-slate-300">Quantity</Label>
                  <Select value={quantityFilter} onValueChange={setQuantityFilter}>
                    <SelectTrigger className="mt-1 bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-slate-200 border border-slate-600">
                      {quantityOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="hover:bg-slate-700">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Filter */}
                <div>
                  <Label className="text-sm font-medium text-slate-300">Price HT</Label>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger className="mt-1 bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-slate-200 border border-slate-600">
                      {priceOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="hover:bg-slate-700">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amount Filter */}
                <div>
                  <Label className="text-sm font-medium text-slate-300">Amount TTC</Label>
                  <Select value={amountFilter} onValueChange={setAmountFilter}>
                    <SelectTrigger className="mt-1 bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-slate-200 border border-slate-600">
                      {amountOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="hover:bg-slate-700">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Discount Filter */}
                <div>
                  <Label className="text-sm font-medium text-slate-300">Discount</Label>
                  <Select value={discountFilter} onValueChange={setDiscountFilter}>
                    <SelectTrigger className="mt-1 bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 text-slate-200 border border-slate-600">
                      {discountOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="hover:bg-slate-700">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-3">
          {searchQuery && (
            <Badge variant="secondary" className="bg-slate-700/80 text-slate-200 border border-slate-600">
              Search: "{searchQuery}"
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="ml-1 h-4 w-4 p-0 hover:bg-slate-600 text-slate-300"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {quantityFilter !== 'any' && (
            <Badge variant="secondary" className="bg-slate-700/80 text-slate-200 border border-slate-600">
              Quantity: {quantityOptions.find(o => o.value === quantityFilter)?.label}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuantityFilter('any')}
                className="ml-1 h-4 w-4 p-0 hover:bg-slate-600 text-slate-300"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {priceFilter !== 'any' && (
            <Badge variant="secondary" className="bg-slate-700/80 text-slate-200 border border-slate-600">
              Price: {priceOptions.find(o => o.value === priceFilter)?.label}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPriceFilter('any')}
                className="ml-1 h-4 w-4 p-0 hover:bg-slate-600 text-slate-300"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {amountFilter !== 'any' && (
            <Badge variant="secondary" className="bg-slate-700/80 text-slate-200 border border-slate-600">
              Amount: {amountOptions.find(o => o.value === amountFilter)?.label}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAmountFilter('any')}
                className="ml-1 h-4 w-4 p-0 hover:bg-slate-600 text-slate-300"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {discountFilter !== 'any' && (
            <Badge variant="secondary" className="bg-slate-700/80 text-slate-200 border border-slate-600">
              Discount: {discountOptions.find(o => o.value === discountFilter)?.label}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDiscountFilter('any')}
                className="ml-1 h-4 w-4 p-0 hover:bg-slate-600 text-slate-300"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {/* Results Counter */}
          <Badge variant="outline" className="bg-slate-700/50 text-slate-300 border border-slate-600">
            {filteredData.length} of {lignes.length} results
          </Badge>
        </div>
      )}
    </div>
  );
} 