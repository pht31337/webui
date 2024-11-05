import { createAction, props } from '@ngrx/store';

export const alertIndicatorPressed = createAction('[Topbar] Alert Indicator Pressed');
export const jobIndicatorPressed = createAction('[Topbar] Job Indicator Pressed');

export const sidenavToggled = createAction('[Topbar] Sidenav Toggled', props<{ isCollapsed: boolean }>());
