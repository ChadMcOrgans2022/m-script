import {  NumberVal, ValueType, RuntimeVal } from "../values.ts";
import { BinaryExpr, NodeType, Program, NumericLiteral, Stmt, Identifier, VarDeclaration, AssignmentExpr } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { MK_NULL } from "../values.ts";
import { evaluate } from '../interpreter.ts';

export function eval_numeric_binary_expr(lhs: NumberVal, rhs: NumberVal, operator: string): NumberVal {
    let result: number;
    if (operator == "+")
        result = lhs.value + rhs.value;
    else if (operator == "-")
        result = lhs.value - rhs.value;
    else if (operator == "*")
        result = lhs.value * rhs.value;
    else if (operator == "/")
        result = lhs.value / rhs.value
    else {
        result = lhs.value % rhs.value
    }
    return { value: result, type: "number" };
}

export function eval_binary_expr (binop:BinaryExpr, env: Environment): RuntimeVal {
    const lhs = evaluate(binop.left, env);
    const rhs = evaluate(binop.right, env);

    if (lhs.type == "number" && rhs.type == "number") {
        return eval_numeric_binary_expr(lhs as NumberVal, rhs as NumberVal, binop.operator);
    }

    // one or both are null
    return MK_NULL();
}
export function eval_identifier ( ident: Identifier, env: Environment): RuntimeVal {
    const val = env.lookupVar(ident.symbol);
    return val;
}

export function eval_assignment ( node: AssignmentExpr, env: Environment): RuntimeVal {
    if (node.assignee.kind != "Identifier") {
        throw `Invalid LHS inside assignment expression ${JSON.stringify(node.assignee)}`
    }
    const varname = (node.assignee as Identifier).symbol;
    return env.assignVar(varname, evaluate(node.value, env))
}