interface Column {
  name: string;
  prop: string;
  hidden: boolean;
  maxWidth: number;
  minWidth: number;
}

export interface TableDisplayedColumns {
  title: string;
  cols: Column[];
}

/**
 * @see defaultPreferences
 */
export interface Preferences {
  dateFormat: string;
  timeFormat: string;
  isSidenavCollapsed: boolean;
  userTheme: string;
  tableDisplayedColumns: TableDisplayedColumns[];
  hideBuiltinUsers: boolean;
  hideBuiltinGroups: boolean;
  autoRefreshReports: boolean;
  showSnapshotExtraColumns: boolean;
  shownNewFeatureIndicatorKeys: string[];

  rebootAfterManualUpdate: boolean;
  lifetime: number;
}
