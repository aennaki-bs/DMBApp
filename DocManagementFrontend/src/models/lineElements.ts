// Line Element Type models
export interface LignesElementType {
  id: number;
  typeElement: string;
  description: string;
  tableName: string;
  createdAt: string;
  updatedAt: string;
}

export interface LignesElementTypeSimple {
  id: number;
  typeElement: string;
  description: string;
}

export interface CreateLignesElementTypeRequest {
  typeElement: string;
  description: string;
  tableName: string;
}

export interface UpdateLignesElementTypeRequest {
  typeElement?: string;
  description?: string;
  tableName?: string;
}

// Item models
export interface Item {
  code: string;
  description: string;
  unite?: string;
  uniteCodeNavigation?: UniteCode;
  createdAt: string;
  updatedAt: string;
  lignesCount: number;
}

export interface ItemSimple {
  code: string;
  description: string;
  unite?: string;
}

export interface CreateItemRequest {
  code: string;
  description: string;
  unite?: string;
}

export interface UpdateItemRequest {
  description?: string;
  unite?: string;
}

// UniteCode models
export interface UniteCode {
  code: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  itemsCount: number;
}

export interface UniteCodeSimple {
  code: string;
  description: string;
}

export interface CreateUniteCodeRequest {
  code: string;
  description: string;
}

export interface UpdateUniteCodeRequest {
  description?: string;
}

// GeneralAccounts models
export interface GeneralAccounts {
  code: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  lignesCount: number;
}

export interface GeneralAccountsSimple {
  code: string;
  description: string;
}

export interface CreateGeneralAccountsRequest {
  code: string;
  description: string;
}

export interface UpdateGeneralAccountsRequest {
  description?: string;
} 