export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  totalPages: number;
  totalElements: number;
  currentPage: number;
  pageSize: number;
}
