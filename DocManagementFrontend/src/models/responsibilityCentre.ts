export interface ResponsibilityCentreSimple {
  id: number;
  code: string;
  descr: string;
}

export interface ResponsibilityCentreUser {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  userType: string;
  isActive: boolean;
  isOnline: boolean;
  createdAt: string;
  profilePicture?: string;
  role?: {
    roleId: number;
    roleName: string;
  };
}

export interface ResponsibilityCentre {
  id: number;
  code: string;
  descr: string;
  createdAt: string;
  updatedAt: string;
  usersCount: number;
  documentsCount: number;
  users: ResponsibilityCentreUser[];
}

export interface CreateResponsibilityCentreRequest {
  code: string;
  descr: string;
} 