export interface Document {
  id: number;
  title: string;
  documentKey: string;
  content: string;
  status: number;
  documentAlias: string;
  createdAt: string;
  updatedAt: string;
  typeId: number;
  docDate: string;
  documentType: DocumentType;
  circuitId?: number;
  circuit?: Circuit;
  currentCircuitDetailId?: number;
  currentCircuitDetail?: CircuitDetail;
  createdByUserId: number;
  createdBy: DocumentUser;
  lignesCount?: number;
  sousLignesCount?: number;
  lignes?: Ligne[];
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
  typeId: number;
  subTypeId?: number | null;
  docDate?: string;
  circuitId?: number;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  documentAlias?: string;
  typeId?: number;
  docDate?: string;
  circuitId?: number;
}

export interface Ligne {
  id: number;
  documentId: number;
  ligneKey: string;
  title: string;
  article: string;
  prix: number;
  createdAt: string;
  updatedAt: string;
  document?: Document;
  sousLignes?: SousLigne[];
  sousLignesCount?: number;
}

export interface CreateLigneRequest {
  documentId: number;
  title: string;
  article: string;
  prix: number;
}

export interface UpdateLigneRequest {
  title?: string;
  article?: string;
  prix?: number;
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
