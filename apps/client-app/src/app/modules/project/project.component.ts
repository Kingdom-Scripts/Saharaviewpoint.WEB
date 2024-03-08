import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    standalone: true,
    imports: [RouterOutlet],
})
export class ProjectComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
