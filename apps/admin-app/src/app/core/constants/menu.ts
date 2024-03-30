import { MenuItem } from '@svp-models';

export class Menu {
  public static pages: MenuItem[] = [
    {
      group: 'Admin Base',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Dashboard',
          route: '/dashboard'
        },
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Projects',
          route: '/project',
        },
      ],
    },
    {
      group: 'Planning and Execution',
      separator: true,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Tasks',
          route: 'projects/:uid/task'
        },
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Board',
          route: '/sprint',
        },
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Timeline',
          route: '/release',
        },
      ]
    },
    {
      group: 'Management',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'All Users',
          route: '/all-users'
        },
        {
          icon: 'assets/icons/heroicons/outline/chart-pie.svg',
          label: 'Project Managers',
          route: '/project-managers',
        },
      ],
    },
    {
      group: 'Config',
      separator: false,
      items: [
        {
          icon: 'assets/icons/heroicons/outline/cog.svg',
          label: 'Settings',
          route: '/settings',
        },
        {
          icon: 'assets/icons/heroicons/outline/bell.svg',
          label: 'Notifications',
          route: '/gift',
        },
      ],
    },
  ];
}
