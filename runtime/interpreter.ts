import {  NumberVal, ValueType, RuntimeVal } from "./values.ts"
import { BinaryExpr, NodeType, Program, NumericLiteral, Stmt, Identifier, VarDeclaration, AssignmentExpr } from "../frontend/ast.ts"
import Environment from "./environment.ts"
import { MK_NULL } from "./values.ts";
import { eval_binary_expr, eval_identifier, eval_numeric_binary_expr, eval_assignment } from './eval/expressions.ts';
import { eval_program, eval_var_declaration } from './eval/statements.ts';

// decorate sprinkles (code here) is equal to export function 


export function evaluate (astNode: Stmt, env: Environment): RuntimeVal {

    switch (astNode.kind) {
        case "NumericLiteral": 
            return { value: ((astNode as NumericLiteral).value), type: "number" } as NumberVal;
        case "Identifier":
            return eval_identifier(astNode as Identifier, env)
        case "AssignmentExpr":
            return eval_assignment(astNode as AssignmentExpr, env);
        case "BinaryExpr":
            return eval_binary_expr(astNode as BinaryExpr, env);

        case "Program":
            return eval_program(astNode as Program, env);
        
            case "VarDeclaration":
                return eval_var_declaration (astNode as VarDeclaration, env);
        default:
            console.log("This AST Node has not yet been setup for interpretation.", astNode);
            Deno.exit(0)
    }

}


