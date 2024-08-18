import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, EventEmitter, Output, Input, AfterViewInit } from '@angular/core';
import * as ace from 'ace-builds';

@Component({
  selector: 'ng-editor',
  standalone: true,
  imports: [CommonModule],
  template: `<div #editor [ngStyle]="{'height': height, 'width': width}"></div>`,
  styles: [],
})
export class EditorComponent implements AfterViewInit {
  @ViewChild('editor') private editor!: ElementRef<HTMLElement>;
  @Output() contentChange = new EventEmitter<string>();
  @Input() inputText = '';
  @Input() isReadOnly = false;
  @Input() height = '60vh';
  @Input() width = '100%';
  @Input() theme = 'xcode';
  @Input() mode = 'yaml';

  @Input() fontSize = '16px';
  @Input() enableBasicAutocompletion = true;
  @Input() enableSnippets = true;
  @Input() enableLiveAutocompletion = true;
  @Input() showGutter = true;

  @Input() aceOptions: any = {};
  private aceEditor!: ace.Ace.Editor;

  ngAfterViewInit(): void {
    ace.config.set('basePath', 'https://unpkg.com/ace-builds@1.35.4/src-noconflict');
    this.aceEditor = ace.edit(this.editor.nativeElement);
    this.initializeEditor();
  }

  private initializeEditor(): void {
    // Apply basic configurations
    this.aceEditor.session.setValue(this.inputText);
    this.aceEditor.setTheme(`ace/theme/${this.theme}`);
    this.aceEditor.session.setMode(`ace/mode/${this.mode}`);
    this.aceEditor.setReadOnly(this.isReadOnly);

    // Apply additional options from aceOptions input
    this.aceEditor.setOptions({
      ...this.aceOptions,
      fontSize: this.fontSize,
      showGutter: this.showGutter,
    });

    // Listen to editor changes
    this.aceEditor.on('change', () => {
      this.contentChange.emit(this.aceEditor.getValue()); // Emit the content on change
    });

    // Adjust editor's size
    this.aceEditor.container.style.height = this.height;
    this.aceEditor.container.style.width = this.width;
    this.aceEditor.resize(true); // Important to call resize after changing size
  }
}
