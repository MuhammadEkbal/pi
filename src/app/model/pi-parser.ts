import {Lexer} from './lexer';
import {Tree} from './tree';

export class PiParser {
  lookahead;	// The next token to be parsed
  line = 1; 	// The current line being parsed
  col = 1;	// The current column being parsed
  lexer;

  constructor() {
    this.setRules();
  }


  setRules() {
    this.lexer = new Lexer((char) => {
      alert('Unexpect token at line ' + this.line + ', col ' + this.col + ': ' + char);
      throw new Error();
    });

    this.lexer.addRule(
      /[ \t]*/,
      new Function('lexeme', '')
    );
    this.lexer.addRule(
      /\n/,
      new Function('lexeme', 'this.col = 1;this.line++;return {id: "NEWLINE", text: "NEWLINE"};')
    );
    this.lexer.addRule(
      /./,
      new Function('lexeme', 'this.reject = true;this.col++;;return {id: "NEWLINE", text: "NEWLINE"};')
    );

    const rules = [
      {rule: /\./, name: 'SEQ'},
      {rule: /\|/, name: 'PAR'},
      {rule: /=/, name: 'ASSIGNMENT'},
      {rule: /\?/, name: 'READ'},
      {rule: /!/, name: 'WRITE'},
      {rule: /new/, name: 'NEW'},
      {rule: /[()]/, name: 'PAREN'},
      {rule: /[A-Z]+[A-Z_]*/, name: 'PROCID'},
      {rule: /[a-z]+[a-z_]*/, name: 'VARID'},
      {rule: /[1-9]+[0-9]*/, name: 'NUM'},
      {rule: /$/, name: 'EOF'}
    ];

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < rules.length; i++) {
      this.lexer.addRule(
        rules[i].rule,
        new Function('lexeme', 'return {id: \'' + rules[i].name + '\', text: lexeme};')
      );
    }
  }

  parse(input) {
    this.lexer.setInput(input);
    this.lookahead = this.lexer.lex();
    const program = {
      processes: {},
      code: []
    };
    while (this.lookahead.id !== 'EOF' && this.lookahead !== undefined) {
      if (this.lookahead.id === 'PROCID') {
        const name = this.procid();
        this.match('ASSIGNMENT');
        program.processes[name] = this.par_statement();
      } else {
        const code = new Tree('ROOT');
        code.addChild(this.par_statement());
        program.code.push(code);
      }

      if (this.lookahead.id === 'NEWLINE') {
        this.match('NEWLINE');
      }
      // program['code'].push(par_statement());

    }
    return program;
  }

  procid() {
    return this.match('PROCID');
  }

  match(id) {
    console.log(this.lookahead.id + ': ' + this.lookahead.text);
    if (this.lookahead.id !== id) {
      alert('Syntax Error at ln: ' + this.line + ' col: ' + this.col + '. Expected: ' + id + ', found: ' + this.lookahead.id);
    }
    const value = this.lookahead.text;
    this.lookahead = this.lexer.lex();
    return value;
  }

  par_statement() {
    console.log('Parse parallel statement');
    const child = this.seq_statement();

    if (this.lookahead.id !== 'PAR') {
      return child;
    }

    const code = new Tree('PAR', child);

    while (this.lookahead.id === 'PAR') {
      this.match('PAR');
      code.addChild(this.par_statement());
    }

    return code;
  }

  seq_statement() {
    const child = this.expression();

    if (this.lookahead.id !== 'SEQ') {
      return child;
    }

    const code = new Tree('SEQ', child);

    while (this.lookahead.id === 'SEQ') {
      this.match('SEQ');
      code.addChild(this.seq_statement());
    }

    return code;
  }

  expression() {
    if (this.lookahead.id === 'VARID') {
      const channel = this.varid();
      if (this.lookahead.id === 'READ') {
        this.match('READ');
        const message = this.varid();
        return new Tree('READ', new Tree(channel), new Tree(message));
      } else {
        this.match('WRITE');
        const message = this.varid();
        return new Tree('WRITE', new Tree(channel), new Tree(message));
      }
    } else if (this.lookahead.id === 'PAREN') {
      this.match('PAREN');
      const proc = this.par_statement();
      this.match('PAREN');
      return proc;
    } else if (this.lookahead.id === 'NEW') {
      this.match('NEW');
      this.match('PAREN');
      const name = this.varid();
      this.match('PAREN');
      return new Tree('NEW', new Tree(name));
    } else if (this.lookahead.id === 'PROCID') {
      return new Tree('PROCID', new Tree(this.procid()));
    }
  }

  varid() {
    if (this.lookahead.id === 'VARID') {
      return this.match('VARID');
    }
    else {
      return this.match('NUM');
    }
  }

}
