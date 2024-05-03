import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { DocumentModel } from "@svp-models";
import { AngularSvgIconModule } from "angular-svg-icon";
import { environment } from "libs/shared/environments/environment";

@Component({
  selector: 'svp-file-uploader',
  templateUrl: './file-uploader.component.html',
  standalone: true,
  imports: [
    CommonModule,
    AngularSvgIconModule
  ],
})
export class FileUploaderComponent {
  
  assetBaseUrl = environment.assetBaseUrl;
  attachments: DocumentModel[] = [
    {
      "id": 17,
      "name": "free-file-icon-1453-thumb.png",
      "type": "Image",
      "url": "f07aa6d8-31f3-4253-909d-956db5dc94b2/5-block-of-flats/bac6751d-97e3-47a7-9f6e-456799eb9d77.png",
      "thumbnailUrl": "f07aa6d8-31f3-4253-909d-956db5dc94b2/5-block-of-flats/_thumbnail/bac6751d-97e3-47a7-9f6e-456799eb9d77.png",
      createdAt: new Date()
    },
    {
      "id": 18,
      "name": "red minimalist Valentine's Day Dinner Menu (Instagram Post)(1).png",
      "type": "Image",
      "url": "f07aa6d8-31f3-4253-909d-956db5dc94b2/5-block-of-flats/03a55e0f-0f5e-4288-8ced-da604ec100ed.png",
      "thumbnailUrl": "f07aa6d8-31f3-4253-909d-956db5dc94b2/5-block-of-flats/_thumbnail/03a55e0f-0f5e-4288-8ced-da604ec100ed.png",
      createdAt: new Date()
    }
  ];
}