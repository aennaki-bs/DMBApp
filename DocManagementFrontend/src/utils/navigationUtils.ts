// Navigation utilities for handling document context
export const getDocumentListRoute = (): string => {
  // Check URL search params for archived context
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get('from') === 'archived') {
    return '/documents/archived';
  }
  
  // Check session storage for archived context (fallback)
  const documentContext = sessionStorage.getItem('documentContext');
  if (documentContext === 'archived') {
    return '/documents/archived';
  }
  
  // Default to active documents
  return '/documents';
};

export const navigateToDocumentList = (navigate: (path: string) => void): void => {
  const route = getDocumentListRoute();
  navigate(route);
};

export const getDocumentContextText = (): string => {
  const route = getDocumentListRoute();
  return route === '/documents/archived' ? 'Archived Documents' : 'Documents';
}; 