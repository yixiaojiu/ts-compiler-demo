import process from 'node:process';
import {
  BinaryExpr,
  Expr,
  Identifier,
  NumericLiteral,
  Program,
  Stmt,
} from './ast';
import { tokenize, Token, TokenType } from './lexer';

export default class Parser {
  private tokens: Token[] = [];

  private not_eof(): boolean {
    return this.tokens[0].type !== TokenType.EOF;
  }

  private at() {
    return this.tokens[0];
  }

  private eat() {
    const prev = this.tokens.shift()!;
    return prev;
  }

  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift();
    if (!prev || prev.type !== type) {
      console.error('Parser Error:\n', err, prev, 'Expecting: ', type);
      process.exit(1);
    }
    return prev;
  }

  public produceAST(sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);

    const program: Program = {
      kind: 'Program',
      body: [],
    };

    // Parse until end of file
    while (this.not_eof()) {
      program.body.push(this.parse_stmt());
    }

    return program;
  }

  private parse_stmt(): Stmt {
    // skip to parse_expr
    return this.parse_expr();
  }

  private parse_expr(): Expr {
    return this.parse_addive_expr();
  }

  private parse_addive_expr(): Expr {
    let left = this.parse_multiplicitave_expr();

    while (this.at().value === '+' || this.at().value === '-') {
      const operator = this.eat().value;
      const right = this.parse_multiplicitave_expr();
      left = {
        kind: 'BinaryExpr',
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_multiplicitave_expr(): Expr {
    let left = this.parse_primary_expr();

    while (
      this.at().value === '/' ||
      this.at().value === '*' ||
      this.at().value === '%'
    ) {
      const operator = this.eat().value;
      const right = this.parse_primary_expr();
      left = {
        kind: 'BinaryExpr',
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // Orders of Prescidence
  // AdditiveExpr
  // MultiplicitaveExpr
  // PrimaryExpr

  private parse_primary_expr(): Expr {
    const tk = this.at().type;

    switch (tk) {
      case TokenType.Identifier:
        return { kind: 'Identifier', symbol: this.eat().value } as Identifier;

      case TokenType.Number:
        return {
          kind: 'NumericLiteral',
          value: parseFloat(this.eat().value),
        } as NumericLiteral;

      case TokenType.OpenParen:
        this.eat(); // open paren
        const value = this.parse_expr();
        this.expect(
          TokenType.CloseParen,
          'Unexpected token found inside parenthesised expression. Expected closing parenthesis'
        ); // close paren
        return value;

      default:
        console.error('Unexpected token found during parsing!', this.at());
        process.exit(1);
    }
  }
}
