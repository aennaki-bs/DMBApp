import { FilterOption } from '../TableAdvancedFilters';

export const DEFAULT_STATUS_FILTERS: FilterOption[] = [
  { id: 0, label: "Any Status", value: "any" },
  { id: 1, label: "Draft", value: "0" },
  { id: 2, label: "In Progress", value: "1" },
  { id: 3, label: "Completed", value: "2" },
  { id: 4, label: "Rejected", value: "3" },
];

export const DEFAULT_TYPE_FILTERS: FilterOption[] = [
  { id: 0, label: "Any Type", value: "any" }
  // Document types will be fetched from API
];

export const DEFAULT_DOCUMENT_SEARCH_FIELDS = [
  { id: 'all', label: 'documents.allFields' },
  { id: 'documentKey', label: 'documents.documentCode' },
  { id: 'title', label: 'common.title' },
  { id: 'documentType.typeName', label: 'common.type' },
  { id: 'docDate', label: 'documents.documentDate' },
  { id: 'documents.createdBy', label: 'documents.createdBy' },
  { id: 'responsibilityCentre', label: 'documents.responsibilityCentre' }
];

export const DEFAULT_USER_SEARCH_FIELDS = [
  { id: 'all', label: 'userManagement.allFields' },
  { id: 'username', label: 'userManagement.username' },
  { id: 'email', label: 'userManagement.email' },
  { id: 'firstName', label: 'userManagement.firstName' },
  { id: 'lastName', label: 'userManagement.lastName' }
];

export const DEFAULT_ITEM_SEARCH_FIELDS = [
  { id: 'all', label: 'All Fields' },
  { id: 'code', label: 'Code' },
  { id: 'description', label: 'Description' },
  { id: 'unite', label: 'Unit Code' }
];

export const DEFAULT_RESPONSIBILITY_CENTRE_SEARCH_FIELDS = [
  { id: 'all', label: 'All fields' },
  { id: 'code', label: 'Code' },
  { id: 'descr', label: 'Description' }
];

export const DEFAULT_STEP_SEARCH_FIELDS = [
  { id: 'all', label: 'All fields' },
  { id: 'title', label: 'Title' },
  { id: 'currentStatus', label: 'Current Status' },
  { id: 'nextStatus', label: 'Next Status' }
];

export const DEFAULT_CIRCUIT_SEARCH_FIELDS = [
  { id: 'all', label: 'All fields' },
  { id: 'title', label: 'Title' },
  { id: 'circuitKey', label: 'Circuit Key' },
  { id: 'descriptif', label: 'Description' }
];

export const DEFAULT_UNIT_CODE_SEARCH_FIELDS = [
  { id: 'all', label: 'All Fields' },
  { id: 'code', label: 'Code' },
  { id: 'description', label: 'Description' }
];

export const DEFAULT_GENERAL_ACCOUNT_SEARCH_FIELDS = [
  { id: 'all', label: 'All Fields' },
  { id: 'code', label: 'Code' },
  { id: 'description', label: 'Description' },
  { id: 'accountType', label: 'Account Type' }
];

export const DEFAULT_LOCATION_SEARCH_FIELDS = [
  { id: 'all', label: 'All Fields' },
  { id: 'locationCode', label: 'Location Code' },
  { id: 'description', label: 'Description' }
];

export const DEFAULT_CUSTOMER_SEARCH_FIELDS = [
  { id: 'all', label: 'All Fields' },
  { id: 'code', label: 'Customer Code' },
  { id: 'name', label: 'Name' },
  { id: 'address', label: 'Address' },
  { id: 'city', label: 'City' },
  { id: 'country', label: 'Country' }
];

export const DEFAULT_VENDOR_SEARCH_FIELDS = [
  { id: 'all', label: 'All Fields' },
  { id: 'vendorCode', label: 'Vendor Code' },
  { id: 'name', label: 'Name' },
  { id: 'address', label: 'Address' },
  { id: 'city', label: 'City' },
  { id: 'country', label: 'Country' }
];
