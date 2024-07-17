export interface MenuItem {
  isAccessible: boolean;
  group: string;
  separator?: boolean;
  selected?: boolean;
  active?: boolean;
  expanded?: boolean;
  items: Array<SubMenuItem>;
}

export interface SubMenuItem {
  isAccessible: boolean;
  icon?: string;
  label?: string;
  route?: string | null;
  expanded?: boolean;
  active?: boolean;
  children?: Array<SubMenuItem>;
}
