var fs = require("fs");
var jison = require("jison");

jison.escopo = 1;
jison.tabelaSimbolo = [

];

jison.simbolosPreInseridos = [];

jison.inserirSimbolos = function (tipo) {

    for (let index = 0; index < jison.simbolosPreInseridos.length; index++) {
        jison.simbolosPreInseridos[index].tipo = tipo;

        let simbolo = {
            token: jison.simbolosPreInseridos[index].token,
            tipo: jison.simbolosPreInseridos[index].tipo,
            valor: jison.simbolosPreInseridos[index].valor,
            escopo: jison.escopo,
        };

        jison.tabelaSimbolo[jison.simbolosPreInseridos[index].lexema + '_' + simbolo.escopo] = simbolo;
    }

    jison.simbolosPreInseridos = [];
};

jison.atualizarEscopos = function () {
    jison.escopo++;
};

jison.inserirPreInseridos = function (simboloPreInserido) {
    jison.simbolosPreInseridos.push(simboloPreInserido);
};

jison.analiseSemantica = function () {
    for (let simboloProp in jison.tabelaSimbolo) {
        let simbolo = jison.tabelaSimbolo[simboloProp];

        if (simbolo.token === 'IDENTIFIER') {
            if (simbolo.valor == null) {
                continue;
            }
            else {
                let tipoValorSimbolo = jison.obterTipoValorSimbolo(simboloProp);

                if(tipoValorSimbolo !== simbolo.tipo){
                    throw "Expressão inválida";
                }
            }
        }
    }
};

jison.obterTipoValorSimbolo = function (simboloName) {
    let simbolo = jison.tabelaSimbolo[simboloName];
    if (simbolo) {
        if (simbolo.valor == null || typeof (simbolo.valor) === 'string' && simbolo.token.indexOf('_LITERAL') >= 0) {// => int b || literal
            return simbolo.tipo;
        }
        else if (typeof (simbolo.valor) === 'object') {
            if (simbolo.valor.oper === 'LIT') {
                return jison.obterTipoValorSimbolo(simbolo.valor.value + "_" + simbolo.escopo);
            }
            else {
                let tipoLeft = jison.obterTipoValorSimbolo(simbolo.valor.left.value + "_" + simbolo.escopo);
                let tipoRight = jison.obterTipoValorSimbolo(simbolo.valor.right.value + "_" + simbolo.escopo);

                if (tipoLeft == tipoRight) {
                    return tipoLeft;
                }
            }
        }
    }

    return "";
}

var grammar = JSON.parse(fs.readFileSync("json/grammar.json", "utf8"));
grammar.lex = JSON.parse(fs.readFileSync("json/lex.json", "utf8"));
grammar.bnf = JSON.parse(fs.readFileSync("json/bnf.json", "utf8"));
grammar.operators = JSON.parse(fs.readFileSync("json/operators.json", "utf8"));

var sourceSuccess = fs.readFileSync("sourceTestSuccess", "utf8");
var sourceError = fs.readFileSync("sourceTestError", "utf8");

// Generate Compiler
var compiler = new jison.Parser(grammar);

var sintaticParser = function (src, srcName) {
    try {
        compiler.parse(src);
        console.log(srcName + ' is a valid code!');
    } catch (error) {
        console.log(srcName + ' is a invalid code:\n');
        console.log(error.toString());
    }
}

sintaticParser(sourceSuccess, "sourceTestSuccess");