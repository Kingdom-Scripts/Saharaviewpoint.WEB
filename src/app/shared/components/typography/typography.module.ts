import { NgModule } from "@angular/core";
import { SvpHeaderComponent } from "./header.component";
import { SvpSubHeaderComponent } from "./sub-header.component";
import { SvpParagraphComponent } from "./paragraph.component";

@NgModule({
  imports: [
    SvpHeaderComponent,
    SvpSubHeaderComponent,
    SvpParagraphComponent
  ],
  exports: [
    SvpHeaderComponent,
    SvpSubHeaderComponent,
    SvpParagraphComponent
  ]
})
export class SvpTypographyModule {}