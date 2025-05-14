export interface PaginatedResponse<T> {
  data: T[];
  total_count: number;
  prev_enable: number;
  next_enable: number;
  total_pages: number;
  per_page: number;
  page: number;
}
