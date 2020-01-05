import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {PiInterpreter} from '../model/pi-interpreter';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {
  }

  printer() {
    const input = 'PRINTER = b?doc.print!doc.PRINTER\n' +
      'SERVER = a!b.SERVER\n' +
      'CLIENT = a?p.p!d.CLIENT\n' +
      'new(a).new(b).(CLIENT|SERVER|PRINTER)';
    d3.select('#code_input').node().value = input;
  }

  run() {
    const interpreter = new PiInterpreter();
    interpreter.loadInput(d3.select('#code_input').node().value);

    d3.select('#code_output').node().value = '';
    d3.select('#code_debug').node().value = '';

    interpreter.run();
  }
}
