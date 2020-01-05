import {PiParser} from './pi-parser';
import * as d3 from 'd3';

export class PiInterpreter {
  data = {};
  updateFunc;
  outputFunc;
  debugFunc;
  parser;
  program;
  constructor() {

  }

  loadInput(input) {
    this.parser = new PiParser();
    this.program = this.parser.parse(input);
    console.log(this.program);
    // program['code'][0].collapse();
  }

  run() {

    this.outputFunc = (line) => {d3.select('#code_output').node().value += line + '\n'; };
    this.debugFunc = (line) => {d3.select('#code_debug').node().value += line + '\n'; };
    console.log(this.program.code[0]);

    const tree = this.program.code[0];
    console.log(tree);
    if (tree === null || tree.children.length === 0) {
      this.outputFunc('DONE');
      console.log(this.data);
      clearInterval(this.updateFunc);
      return;
    }
    this.execute(tree);
    tree.collapse();

    this.updateFunc = setInterval(() => {
      const tree = this.program.code[0];
      console.log(tree);
      if (tree === null || tree.children.length === 0) {
        this.outputFunc('DONE');
        console.log(this.data);
        clearInterval(this.updateFunc);
        return;
      }
      this.execute(tree);
      tree.collapse();
    }, 100);
    // for(let i = 0; i < 10; i++)
    // 	update();
  }
  update() {
    // program['code'][0].collapse();
    const tree = this.program.code[0];
    console.log(tree);
    if (tree === null || tree.children.length === 0) {
      this.outputFunc('DONE');
      console.log(this.data);
      clearInterval(this.updateFunc);
      return;
    }
    this.execute(tree);
    tree.collapse();
  }

  execute(node) {
    if (node === undefined) {
      return;
    }
    // console.log(node.data);
    const currentNode = node;
    if (node.data === 'ROOT') {
      this.execute(node.children[0]);
    } else if (node.data === 'PAR') {
      // tslint:disable-next-line:forin
      for (const i in node.children) {
        this.execute(node.children[i]);
      }
    } else if (node.data === 'SEQ') {
      this.execute(node.children[0]);
    } else if (node.data === 'WRITE') {
      const channel = node.children[0].data;
      const dest = this.data[channel] === undefined ? channel : this.data[channel];
      let value = this.data[node.children[1].data];
      if (value === undefined) {
        value = node.children[1].data;
      }

      if (channel === 'print') {
        this.outputFunc('PRINT ' + value);
      } else {
        this.data[dest] = value;
      }

      node.removeFromParent();
      this.debugFunc('Write ' + value + ' to ' + dest);
    } else if (node.data === 'READ') {
      const channel = node.children[0].data;
      if (this.data[channel] !== undefined) {
        this.debugFunc('Read ' + this.data[channel] + ' from ' + channel);

        node.removeFromParent();
        this.data[node.children[1].data] = this.data[channel];
        // delete this.data[channel];
      }
    } else if (node.data === 'NEW') {
      this.debugFunc('Create new channel ' + node.children[0].data);
      node.removeFromParent();
    } else if (node.data === 'PROCID') {
      const name = node.children[0].data;
      if (this.program.processes[name] !== undefined) {
        node.replaceWith(this.program.processes[name].copyTree());
        this.debugFunc('Running ' + name);
      } else {
        node.removeFromParent();
      }
    }
  }

}
