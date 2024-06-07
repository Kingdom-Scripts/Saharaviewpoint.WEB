import { NgModule } from "@angular/core";
import { SvpAnchorComponent } from "./svp-anchor.component";
import { SvpCardSelectorComponent } from "./svp-card-selector.component";
import { SvpSearchButtonComponent } from "./search-button.component";
import { SvpStatusCardComponent } from "./status-card.component";

@NgModule({
  imports: [
    SvpAnchorComponent,
    SvpCardSelectorComponent,
    SvpSearchButtonComponent,
    SvpStatusCardComponent
  ],
  exports: [
    SvpAnchorComponent,
    SvpCardSelectorComponent,
    SvpSearchButtonComponent,
    SvpStatusCardComponent
  ]
})
export class SvpUtilityModule {}