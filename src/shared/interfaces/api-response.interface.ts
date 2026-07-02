export interface ApiResponse<T> {
  success: boolean;
  data: T;
  statusCode: number;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string | string[];
  error: string;
  statusCode: number;
  timestamp: string;
}
