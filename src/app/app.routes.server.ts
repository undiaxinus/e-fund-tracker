import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'admin/users/edit/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/manage-users/edit/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/user-management/edit/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'user/entries/edit/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/archived-data',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'admin/settings',
    renderMode: RenderMode.Prerender
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
