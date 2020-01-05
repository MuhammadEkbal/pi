export class Tree {
  data;
  children;
  parent;

  constructor(data, t1?, t2?) {
    this.data = data;
    this.children = [];
    this.parent = null;
    for (let i = 1; i < arguments.length; i++) {
      this.children.push(arguments[i]);
      arguments[i].parent = this;
    }
  }

  addChild(n) {
    if (n === undefined) {
      return;
    }
    this.children[this.children.length] = n;
    n.parent = this;
  }

  removeChild(n) {
    const i = this.children.indexOf(n);
    if (i > -1) {
      this.children.splice(i, 1);
    }
    n.parent = null;
  }

  replaceWith(n) {
    const i = this.parent.children.indexOf(this);
    n.parent = this.parent;
    this.parent.children[i] = n;
  }

  removeFromParent() {
    const parent = this.parent;
    if (parent === null) {
      return;
    }
    parent.removeChild(this);
  }

  collapse() {
    if (this.children.length === 0) {
      return;
    }
    if (this.data === 'PAR' || this.data === 'SEQ') {
      if (this.children.length === 1) {
        const parent = this.parent;
        this.data = this.children[0].data;
        this.children = this.children[0].children;
        for (const i in this.children) {
          this.children[i].parent = this;
        }
      }
    }
    for (const i in this.children) {
      // this.children[i].parent = this;
      this.children[i].collapse();
    }
  }

  copyTree() {
    const node = new Tree(this.data);
    for (let i = 0; i < this.children.length; i++) {
      node.addChild(this.children[i].copyTree());
    }
    return node;
  }

  printInOrder() {
    let str = '';
    for (let i = 0; i < this.children.length; i++) {
      str += this.children[i].printInOrder();
      str += this.data;
    }
    // str += this.children[this.children.length-1].printInOrder();
    return str;
  }
}
