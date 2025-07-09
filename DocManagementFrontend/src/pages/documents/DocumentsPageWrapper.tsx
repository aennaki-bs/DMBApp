
import { DocumentsFilterProvider } from '@/hooks/documents/useDocumentsFilter';
import DocumentsPage from './DocumentsPage';

export default function DocumentsPageWrapper() {
  return (
    <DocumentsFilterProvider>
      <DocumentsPage />
    </DocumentsFilterProvider>
  );
}
