import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { test, expect } from 'vitest';
import Parser from '../frontend/parser';
import { evaluate } from '../runtime/interpreter';
import Environment from '../runtime/environment';
import { MK_BOOL, MK_NULL, MK_NUMBER, NumberVal } from '../runtime/values';

test('index', () => {
  expect(1).toBe(1);
  const sourceCode = readFileSync(
    resolve(process.cwd(), 'test/sourceCode.txt'),
    { encoding: 'utf-8' }
  );
  const parser = new Parser();
  const program = parser.produceAST(sourceCode);

  const env = new Environment();
  env.declareVar('x', MK_NUMBER(100));
  env.declareVar('true', MK_BOOL(true));
  env.declareVar('false', MK_BOOL(false));
  env.declareVar('null', MK_NULL());

  const result = evaluate(program, env);
  console.log(result);
});
