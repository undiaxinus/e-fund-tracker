import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Components will be imported here as they are created
// import { FormControlComponent } from './components/form-control/form-control.component';
// import { DataTableComponent } from './components/data-table/data-table.component';
// import { ModalComponent } from './components/modal/modal.component';

// Directives will be imported here
// import { HighlightDirective } from './directives/highlight.directive';

// Pipes will be imported here
// import { CurrencyFormatPipe } from './pipes/currency-format.pipe';
// import { FilterPipe } from './pipes/filter.pipe';

const SHARED_COMPONENTS: any[] = [
  // FormControlComponent,
  // DataTableComponent,
  // ModalComponent,
];

const SHARED_DIRECTIVES: any[] = [
  // HighlightDirective,
];

const SHARED_PIPES: any[] = [
  // CurrencyFormatPipe,
  // FilterPipe,
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule
  ],
  declarations: [
    ...SHARED_COMPONENTS,
    ...SHARED_DIRECTIVES,
    ...SHARED_PIPES
  ],
  exports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    ...SHARED_COMPONENTS,
    ...SHARED_DIRECTIVES,
    ...SHARED_PIPES
  ]
})
export class SharedModule { }