import { Routes } from "@angular/router";
import { ListSettingsComponent } from "./page-settings/components/list-settings/list-settings.component";
import { Setting1Component } from "./page-settings/components/setting-1/setting-1.component";
import { Setting2Component } from "./page-settings/components/setting-2/setting-2.component";

export const SETTING_ROUTES: Routes = [
  { path: '', component: ListSettingsComponent },
  { path: 'setting1', component: Setting1Component },
  { path: 'setting2', component: Setting2Component }
];