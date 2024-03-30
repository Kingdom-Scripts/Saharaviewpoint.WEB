import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output, inject } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { MaxInputLengthComponent, SideViewService, SvpButtonModule, SvpFormInputModule, SvpTypographyModule } from "@svp-components";
import { AngularSvgIconModule } from "angular-svg-icon";
import { Observable, Subject } from "rxjs";

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule,
    ReactiveFormsModule,
    NgSelectModule,
    SvpButtonModule,
    SvpTypographyModule,
    SvpFormInputModule,
    MaxInputLengthComponent
  ]
})
export class AddTaskComponent implements OnInit {
  sideViewService = inject(SideViewService);
  fb = inject(FormBuilder);
  
  @Input() projectUid!: string;
  @Output() exit = new EventEmitter();

  formGroup!: FormGroup;
  taskTypes!: [];
  projects$: Observable<[]> = new Observable<[]>();
  projectInput$ = new Subject<string>();
  projectLoading = false;

  reporters$: Observable<[]> = new Observable<[]>();
  reporterInput$ = new Subject<string>();
  reporterLoading = false;

  attachments: File[] | null = null;

  ngOnInit(): void {
    console.log('Product UID:', this.projectUid);
    this.initForm();
  }

  initForm(): void {
    this.formGroup = this.fb.group({
      projectId: [''],
      type: [''],
      summary: [''],
      description: [''],
      reporterId: [''],      
      dueDate: [''],
      attachments: [''],
    });
  }

  onFilesChanged(files: File[]) {
    if (files.length > 0) {
      this.attachments = files;
    }
  }
  
  close() {
    this.exit.emit();
  }
}