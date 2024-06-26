import { Paging } from "./Paging";

export class Result<T> {
  content?: T;
  detail?: string;
  instance?: string;
  message?: string;
  path?: string;
  status?: number;
  success?: boolean;
  title?: string;
  type?: number;
  validationErrors?: { [key: string]: string[] };
  paging?: Paging;
}

export class ValidationResult {

}