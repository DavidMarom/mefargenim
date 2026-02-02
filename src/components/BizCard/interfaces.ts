export interface BusinessDocument {
  _id?: string | { toString(): string };
  title?: string;
  type?: string;
  phone?: string;
  city?: string;
  [key: string]: unknown;
}

export interface BizCardProps {
  document: BusinessDocument;
}

export interface LikeResponse {
  success: boolean;
  liked?: boolean;
  count?: number;
}

export interface UserCheckResponse {
  created?: boolean;
  exists?: boolean;
}
