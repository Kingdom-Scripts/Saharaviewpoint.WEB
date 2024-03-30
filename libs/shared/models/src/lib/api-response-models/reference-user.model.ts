export class ReferenceUserModel {
  id!: number;
  firstName!: string;
  lastName!: string;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}