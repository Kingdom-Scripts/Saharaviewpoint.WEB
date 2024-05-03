export interface AuthRoleData {
  SvpAdmin: boolean;
  SvpManager: boolean;
  BusinessAdmin: boolean;
  BusinessManager: boolean;
  BusinessClient: boolean;
  Client: boolean;
  SuperAdmin: boolean;
  [key: string]: boolean; // Index signature
}