export interface ResponsibilityCentre {
  id: number;
  code: string;
  descr: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  usersCount?: number;
  documentsCount?: number;
}

export interface ResponsibilityCentreSimple {
  id: number;
  code: string;
  descr: string;
  isActive: boolean;
}

export interface CreateResponsibilityCentreRequest {
  code: string;
  descr: string;
}

export interface UpdateResponsibilityCentreRequest {
  code?: string;
  descr?: string;
  isActive?: boolean;
}

export interface ValidateCodeRequest {
  code: string;
} 