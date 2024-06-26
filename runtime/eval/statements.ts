import {  NumberVal, ValueType, RuntimeVal } from "../values.ts"
import { BinaryExpr, NodeType, Program, NumericLiteral, Stmt, Identifier, VarDeclaration } from "../../frontend/ast.ts"
import Environment from "../environment.ts"
import { MK_NULL } from "../values.ts";
import { evaluate } from '../interpreter.ts'

export function eval_program (program: Program, env: Environment): RuntimeVal {
    let lastEvaluated: RuntimeVal = MK_NULL();
    

    for (const statement of program.body) {
        lastEvaluated = evaluate(statement, env);
    }

    return lastEvaluated;
}

export function eval_var_declaration(declaration: VarDeclaration, env: Environment): RuntimeVal {
    const value = declaration.value ? evaluate(declaration.value, env   ) : MK_NULL();

    return env.declareVar(declaration.identifier, value, declaration.constant);

  }