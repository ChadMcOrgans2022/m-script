import { VarDeclaration, Stmt, Program, Expr, BinaryExpr, NumericLiteral, Identifier} from ".//ast.ts";
import { tokenize, Token, TokenType } from ".//lexer.ts";

export default class Parser {
    private tokens : Token[] = [];

    private not_eof (): boolean {
        return this.tokens[0].type != TokenType.EOF
    }

    private at () {
        return this.tokens[0] as Token;
    }

    private next () {
        const prev = this.tokens.shift() as Token;
        return prev;
    }
    
    private expect (type: TokenType, err: any) {
        const prev = this.tokens.shift() as Token;
        if (!prev || prev.type != type) {
            console.error("Parser Error:\n", err, prev, " - Expecting: ", type);
            Deno.exit(1);
        }
        return prev;
    }

    public produceAST (srcCode: string): Program {
        this.tokens = tokenize(srcCode);
        const program: Program = {
            kind: "Program",
            body: [],
        }
        // Parse until EOF
        while (this.not_eof()) {
            program.body.push(this.parse_stmt());
        }

        return program
    }

    private parse_stmt (): Stmt {
        switch (this.at().type) {
            case TokenType.Let:
            case TokenType.Const:
                return this.parse_var_declaration();
            default:
                return this.parse_expr();
        }
    }
    // LET IDENT;
    // (LET / CONST) IDENT = EXPR;
    parse_var_declaration(): Stmt {
        
        const isConstant = this.next().type == TokenType.Const;
        const identifier = this.expect(TokenType.Identifier, "Expected identifier name following let | const keywords.").value;

        if (this.at().type == TokenType.Semicolon) {
            this.next();
            if (isConstant) {
                throw "Expected value for constant, but no value was provided.";
            }
        }
        return { kind: "VarDeclaration", identifier, constant: false, value: undefined } as VarDeclaration;
        
        this.expect(TokenType.Equals, "Expected equals token following identifier in variable declaration, but none were found.");
        const declaration = { kind: "VarDeclaration", value: this.parse_expr(), constant: isConstant } as VarDeclaration;

        this.expect(
            TokenType.Semicolon,
            "Variable declaration statement must end with a semicolon."
        );
        return declaration;
    }

    private parse_expr (): Expr {
        return this.parse_additive_expr();
    }

    // 10 + 5 - 5
    private parse_additive_expr (): Expr {
        let left = this.parse_multiplicative_expr();

        while (this.at().value == "+" || this.at().value == "-") {
            const operator = this.next().value;
            const right = this.parse_multiplicative_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }
    private parse_multiplicative_expr (): Expr {
        let left = this.parse_pri_expr();

        while (this.at().value == "/" || this.at().value == "*" || this.at().value == "%") {
            const operator = this.next().value;
            const right = this.parse_pri_expr();
            left = {
                kind: "BinaryExpr",
                left,
                right,
                operator,
            } as BinaryExpr;
        }

        return left;
    }


    // Orders of Prescidence
    // AssignmentExpr
    // MemberExpr
    // FunctionCall
    // LogicalExpr
    // ComparisonExpr
    // AdditiveExpr
    // MultiplicitaveExpr
    // UnaryExpr
    // PrimaryExpr
    private parse_pri_expr (): Expr {
        const tk = this.at().type;

        switch (tk) {
            case TokenType.Identifier:
                return {kind: "Identifier", symbol: this.next().value} as Identifier;

            case TokenType.Number: 
                return {
                    kind: "NumericLiteral", 
                    value: parseFloat(this.next().value)
                } as NumericLiteral;
            case TokenType.OpenParen: {
                
                    this.next();
                    const value = this.parse_expr();
                    this.expect(TokenType.CloseParen, "Unexpected token found inside parenthesised expression. Expected closing parenthesis.",);
                    return value;
            }                    

        default:
            console.error("Unexpected token found during parsing!", this.at())
            Deno.exit(1)
        }
    }
}