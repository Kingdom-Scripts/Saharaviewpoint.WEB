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
          icon: 'assets/icons/project.svg',
          label: 'Projects',
          route: '/project',
        },
        {
          icon: 'assets/icons/tasks-app.svg',
          label: 'Tasks',
          route: '/tasks',
          children: [
            { label: 'All Tasks', route: '/tasks/all' },
            { label: 'Board', route: '/tasks/board' }
          ]
        },
      ],
    },
    {
      group: 'Management',
      separator: false,
      items: [
        {
          icon: 'assets/icons/users.svg',
          label: 'User Management',
          route: '/users',
          children: [
            { label: 'Project Managers', route: '/users/project-managers' }
          ]
        },
        // {
        //   icon: 'assets/icons/heroicons/outline/chart-pie.svg',
        //   label: 'Project Managers',
        //   route: '/project-managers',
        // },
      ],
    },
    // {
    //   group: 'Config',
    //   separator: false,
    //   items: [
    //     {
    //       icon: 'assets/icons/heroicons/outline/cog.svg',
    //       label: 'Settings',
    //       route: '/settings',
    //     },
    //     {
    //       icon: 'assets/icons/heroicons/outline/bell.svg',
    //       label: 'Notifications',
    //       route: '/gift',
    //     },
    //   ],
    // },
  ];
}
