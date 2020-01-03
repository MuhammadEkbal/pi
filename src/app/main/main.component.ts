import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  printer() {
    const input = 'PRINTER = b?doc.print!doc.PRINTER\n' +
      'SERVER = a!b.SERVER\n' +
      'CLIENT = a?p.p!d.CLIENT\n' +
      'new(a).new(b).(CLIENT|SERVER|PRINTER)';
    // @ts-ignore
    document.getElementById('code_input').value = input;
  }
}
