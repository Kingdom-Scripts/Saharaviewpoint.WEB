import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output, booleanAttribute } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";

@Component({
  selector: 'svp-file-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="" [formGroup]="svpForm">
      <div class="flex flex-col items-center justify-center w-full">
        <label for="{{svpId}}" class="w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:border-night-500 dark:bg-night-700 hover:border-solid"
            [ngClass]="{
              'rounded-es-none rounded-ee-none': selectedFiles.length > 0,
              'flex flex-col items-center justify-center hover:bg-gray-100 dark:hover:bg-night-600' : selectedFiles.length == 0,
            }" 
            [style.height.rem]="selectedFiles.length == 0 ? height : null">
            <div class="flex "
              [ngClass]="{
                'p-3 space-x-2': selectedFiles.length > 0,
                'pt-5 pb-6 flex-col items-center justify-center': selectedFiles.length == 0
                }">
                <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-night-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p class="mb-2 text-sm text-gray-500 dark:text-night-200">
                  TODO: fix this selector to be able to drag and drop files
                  <!-- <span class="font-semibold">Click to upload</span> or drag and drop <br /> -->
                  <span class="font-semibold">Click to upload files</span> <br />
                  <span class="text-xs" [ngClass]="{'mt-1': selectedFiles.length > 0}">SVG, PNG, JPG or GIF (MAX. 800x400px)</span>
                </p>
            </div>

            <input id="{{svpId}}" formControlName="{{svpId}}" type="file" class="hidden" [multiple]="isMultiple" (change)="handleFileInput($event)"/>
        </label>
        
        <!-- Container to display selected files -->
        <div class="w-full px-2 pt-2 border-2 border-t-0 border-gray-300 border-dashed rounded-ee-lg rounded-es-lg bg-gray-50 max-h-56 overflow-auto dark:border-night-500 dark:bg-night-700" [hidden]="selectedFiles.length == 0">
          <div class="flex flex-wrap gap-2">
              <div *ngFor="let file of selectedFiles" class="flex items-center bg-gray-100 p-2 rounded dark:bg-night-700">
                  <p class="mr-2 dark:text-night-200">{{ file.name }}</p>
                  <button type="button" class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-600" (click)="removeFile(file)">Delete </button>
              </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SvpFileSelector {
  @Input({required: true}) svpId: string = '';
  @Input({required: true}) svpForm!: FormGroup;
  @Input({transform: booleanAttribute}) isMultiple = false;
  @Input() height: number | null = null;

  @Output() onFileChanged: EventEmitter<File[]> = new EventEmitter<File[]>();

  selectedFiles: File[] = [];

  handleFileInput(e: any): void {

    let files = e.target.files as File[];
    if (files == null) {
      console.log('--> Files is null');
      return;
    };
    
    // Convert FileList to Array and update selectedFiles
    this.selectedFiles.push(...Array.from(files));

    // Emit the updated selectedFiles array
    this.onFileChanged.emit(this.selectedFiles);
  }

  // Function to remove a file from the selected files array
  removeFile(fileToRemove: File): void {
    // filter our the file to remove
    this.selectedFiles = this.selectedFiles.filter(file => file !== fileToRemove);

    // Emit the updated selectedFiles array
    this.onFileChanged.emit(this.selectedFiles);
  }
}