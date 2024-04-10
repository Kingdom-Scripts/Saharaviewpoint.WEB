import { Injectable } from '@angular/core';
import { ProjectModel } from '@svp-models';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageUtility {
  set(key: string, value: string) {
    sessionStorage.setItem(key, value);
  }

  get(key: string) {
    return sessionStorage.getItem(key);
  }

  remove(key: string) {
    sessionStorage.removeItem(key);
  }

  setProject(project: ProjectModel) {
    this.set('project', JSON.stringify(project));
  }

  getProject(): ProjectModel | null {
    const project = this.get('project');

    return project != 'undefined' ? JSON.parse(project as string) : null;
  }
}
