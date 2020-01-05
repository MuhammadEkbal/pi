export class Lexer {
  tokens = [];
  rules = [];
  remove = 0;
  state = 0;
  index = 0;
  input = '';
  defunct;
  reject;

  constructor(defunct) {
    if (typeof defunct !== 'function') {
      this.defunct = function(chr) {
        throw new Error('Unexpected character at index ' + (this.index - 1) + ': ' + chr);
      };
    } else {
      this.defunct = defunct;
    }

  }


  getRules() {
    return this.rules;
  }

  addRule(pattern, action, start?) {
    const global = pattern.global;

    if (!global) {
      let flags = 'g';
      if (pattern.multiline) { flags += 'm'; }
      if (pattern.ignoreCase) { flags += 'i'; }
      pattern = new RegExp(pattern.source, flags);
    }

    if (Object.prototype.toString.call(start) !== '[object Array]') { start = [0]; }

    this.rules.push({
      pattern,
      global,
      action,
      start
    });

    return this;
  }

  setInput(input) {
    this.remove = 0;
    this.state = 0;
    this.index = 0;
    this.tokens.length = 0;
    this.input = input;
    return this;
  }

  lex() {
    if (this.tokens.length) { return this.tokens.shift(); }

    this.reject = true;

    while (this.index <= this.input.length) {
      const matches = this.scan.call(this).splice(this.remove);
      const index = this.index;

      while (matches.length) {
        if (this.reject) {
          const match = matches.shift();
          const result = match.result;
          const length = match.length;
          this.index += length;
          this.reject = false;
          this.remove++;

          let token = match.action.apply(this, result);
          if (this.reject) { this.index = result.index; }
          else if (typeof token !== 'undefined') {
            switch (Object.prototype.toString.call(token)) {
              case '[object Array]':
                this.tokens = token.slice(1);
                token = token[0];
              default:
                if (length) { this.remove = 0; }
                return token;
            }
          }
        } else { break; }
      }

      const input = this.input;

      if (index < input.length) {
        if (this.reject) {
          this.remove = 0;
          const token = this.defunct.call(this, input.charAt(this.index++));
          if (typeof token !== 'undefined') {
            if (Object.prototype.toString.call(token) === '[object Array]') {
              this.tokens = token.slice(1);
              return token[0];
            } else { return token; }
          }
        } else {
          if (this.index !== index) { this.remove = 0; }
          this.reject = true;
        }
      } else if (matches.length) {
        this.reject = true;
             }
      else { break; }
    }
  }

  scan() {
    const matches = [];
    let index = 0;


    const state = this.state;
    const lastIndex = this.index;
    const input = this.input;
    for (let i = 0, length = this.rules.length; i < length; i++) {
      const rule = this.rules[i];
      const start = rule.start;
      const states = start.length;

      if ((!states || start.indexOf(state) >= 0) ||
        (state % 2 && states === 1 && !start[0])) {
        const pattern = rule.pattern;
        pattern.lastIndex = lastIndex;
        const result = pattern.exec(input);

        if (result && result.index === lastIndex) {
          let j = matches.push({
            result,
            action: rule.action,
            length: result[0].length
          });

          if (rule.global) { index = j; }

          while (--j > index) {
            const k = j - 1;

            if (matches[j].length > matches[k].length) {
              const temple = matches[j];
              matches[j] = matches[k];
              matches[k] = temple;
            }
          }
        }
      }
    }

    return matches;
  }

}
