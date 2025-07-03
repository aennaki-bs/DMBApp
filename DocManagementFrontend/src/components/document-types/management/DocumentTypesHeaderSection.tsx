import DocumentTypesHeader from '../DocumentTypesHeader';

interface DocumentTypesHeaderSectionProps {
  viewMode: 'table' | 'grid';
  onViewModeChange: (value: 'table' | 'grid') => void;
  onNewTypeClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  onSmartFilterClick?: () => void;
  onSmartSelectClick?: () => void;
}

const DocumentTypesHeaderSection = ({
  viewMode,
  onViewModeChange,
  onNewTypeClick,
  searchQuery,
  onSearchChange,
  showFilters,
  onToggleFilters,
  onSmartFilterClick,
  onSmartSelectClick
}: DocumentTypesHeaderSectionProps) => {
  return (
    <DocumentTypesHeader
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      onNewTypeClick={onNewTypeClick}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      showFilters={showFilters}
      onToggleFilters={onToggleFilters}
      onSmartFilterClick={onSmartFilterClick}
      onSmartSelectClick={onSmartSelectClick}
    />
  );
};

export default DocumentTypesHeaderSection;
