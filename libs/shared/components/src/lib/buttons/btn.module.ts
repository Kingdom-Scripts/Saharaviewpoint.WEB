import { NgModule } from "@angular/core";
import { SvpNeutralButtonComponent } from "./btn-neutral.component";
import { SvpPrimaryButtonComponent } from "./btn-primary.component";
import { SvpAnchorNeutralButtonComponent } from "./anchor-neutral.component";
import { SvpActionButtonComponent } from "./btn-action.component";

@NgModule({
  imports: [
    SvpPrimaryButtonComponent,
    SvpNeutralButtonComponent,
    SvpAnchorNeutralButtonComponent,
    SvpActionButtonComponent
  ],
  exports: [
    SvpPrimaryButtonComponent,
    SvpNeutralButtonComponent,
    SvpAnchorNeutralButtonComponent,
    SvpActionButtonComponent
  ]
})
export class SvpButtonModule {}