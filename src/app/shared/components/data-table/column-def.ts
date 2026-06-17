// Column definition interface for DataTableComponent

export type SortDirection = 'asc' | 'desc' | null;

export interface ColumnDef {
  /** Unique key — maps to the data property name */
  key: string;
  /** Header label displayed in <th> */
  header: string;
  /** Whether this column is sortable (default: false) */
  sortable?: boolean;
  /** Extra CSS classes for the header cell */
  headerClass?: string;
  /** Extra CSS classes for all body cells in this column */
  cellClass?: string;
}

export interface SortState {
  /** Column key currently being sorted */
  column: string;
  /** Sort direction */
  direction: SortDirection;
}
