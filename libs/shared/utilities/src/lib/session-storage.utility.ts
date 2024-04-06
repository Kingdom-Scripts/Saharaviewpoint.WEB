import { Injectable } from '@angular/core';

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

  setProjectId(projectId: number) {
    this.set('projectId', projectId.toString());
  }

  getProjectId(): number | null {
    return parseInt(this.get('projectId') ?? '');
  }
}
