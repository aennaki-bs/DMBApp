import DocumentTypesSimpleHeader from '../DocumentTypesSimpleHeader';

interface DocumentTypesSimpleHeaderSectionProps {
  viewMode: 'table' | 'grid';
  onViewModeChange: (value: 'table' | 'grid') => void;
  onNewTypeClick: () => void;
}

const DocumentTypesSimpleHeaderSection = ({
  viewMode,
  onViewModeChange,
  onNewTypeClick,
}: DocumentTypesSimpleHeaderSectionProps) => {
  return (
    <DocumentTypesSimpleHeader
      viewMode={viewMode}
      onViewModeChange={onViewModeChange}
      onNewTypeClick={onNewTypeClick}
    />
  );
};

export default DocumentTypesSimpleHeaderSection; 