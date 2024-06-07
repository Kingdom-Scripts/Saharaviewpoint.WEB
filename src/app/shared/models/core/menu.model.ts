export interface MenuItem {
  group: string;
  separator?: boolean;
  selected?: boolean;
  active?: boolean;
  expanded?: boolean;
  items: Array<SubMenuItem>;
}

export interface SubMenuItem {
  icon?: string;
  label?: string;
  route?: string | null;
  expanded?: boolean;
  active?: boolean;
  children?: Array<SubMenuItem>;
}
