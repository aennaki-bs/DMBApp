import { ResponsibilityCentreSimple } from './responsibilityCentre';
import { 
  LignesElementType, 
  Item, 
  UniteCode, 
  GeneralAccounts 
} from './lineElements';
import { SubType } from './subtype';
import './circuit.d.ts';

export interface Document {
  id: number;
  title: string;
  documentKey: string;
  content: string;
  status: number;
  documentAlias: string;
  documentExterne?: string;
  createdAt: string;
  updatedAt: string;
  typeId: number;
  subTypeId?: number;
  docDate: string;
  comptableDate: string;
  documentType: DocumentType;
  subType?: SubType;
  circuitId?: number;
  circuit?: Circuit;
  currentCircuitDetailId?: number;
  currentCircuitDetail?: CircuitDetail;
  createdByUserId: number;
  createdBy: DocumentUser;
  updatedByUserId?: number;
  updatedBy?: DocumentUser;
  lignesCount?: number;
  sousLignesCount?: number;
  lignes?: Ligne[];
  responsibilityCentreId?: number;
  responsibilityCentre?: ResponsibilityCentreSimple;
}

export interface DocumentType {
  id?: number;
  typeName: string;
  typeKey?: string;
  typeAttr?: string;
  documentCounter?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DocumentUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  email: string;
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
  documentAlias?: string;
  documentExterne?: string;
  typeId: number;
  subTypeId?: number | null;
  docDate?: string;
  circuitId?: number;
  responsibilityCentreId?: number;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  documentAlias?: string;
  documentExterne?: string;
  typeId?: number;
  docDate?: string;
  comptableDate?: string;
  circuitId?: number;
}

export interface Ligne {
  id: number;
  documentId: number;
  ligneKey: string;
  title: string;
  article: string;
  
  // Legacy field
  prix: number;
  
  sousLignesCount: number;
  
  // Type information - FIXED field names to match backend
  lignesElementTypeId?: number;
  lignesElementType?: LignesElementType;
  
  // Element references
  itemCode?: string;
  item?: Item;
  generalAccountsCode?: string;
  generalAccounts?: GeneralAccounts;
  
  // Pricing fields
  quantity: number;
  priceHT: number;
  discountPercentage: number;
  discountAmount?: number;
  vatPercentage: number;
  
  // Calculated fields
  amountHT: number;
  amountVAT: number;
  amountTTC: number;
  
  createdAt: string;
  updatedAt: string;
  document?: Document;
  sousLignes?: SousLigne[];
}

export interface CreateLigneRequest {
  documentId: number;
  ligneKey?: string;
  title: string;
  article: string;
  
  // Type and element references - FIXED field names
  lignesElementTypeId?: number;
  itemCode?: string;
  generalAccountsCode?: string;
  
  // Pricing fields
  quantity: number;
  priceHT: number;
  discountPercentage: number;
  discountAmount?: number;
  vatPercentage: number;
}

export interface UpdateLigneRequest {
  ligneKey?: string;
  title?: string;
  article?: string;
  
  // Type and element references - FIXED field names
  lignesElementTypeId?: number;
  itemCode?: string;
  generalAccountsCode?: string;
  
  // Pricing fields
  quantity?: number;
  priceHT?: number;
  discountPercentage?: number;
  discountAmount?: number;
  vatPercentage?: number;
}

export interface SousLigne {
  id: number;
  ligneId: number;
  sousLigneKey?: string;
  title: string;
  attribute: string;
  createdAt?: string;
  updatedAt?: string;
  ligne?: Ligne;
}

export interface CreateSousLigneRequest {
  ligneId: number;
  title: string;
  attribute: string;
}

export interface UpdateSousLigneRequest {
  title?: string;
  attribute?: string;
}
