var fs = require("fs");
var jison = require("jison");

var resultado = {

};

jison.escopo = 1;
jison.tabelaSimbolo = [

];

jison.simbolosPreInseridos = [];

jison.inserirSimbolos = function (tipo) {

    for (let index = 0; index < jison.simbolosPreInseridos.length; index++) {
        // jison.simbolosPreInseridos[index].tipo = jison.simbolosPreInseridos[index].token.indexOf('_LITERAL') < 0 ? tipo : jison.simbolosPreInseridos[index].tipo;

        if(!jison.simbolosPreInseridos[index].tipo){
            jison.simbolosPreInseridos[index].tipo = tipo;
        }

        let simbolo = {
            token: jison.simbolosPreInseridos[index].token,
            valor: jison.simbolosPreInseridos[index].valor,
            escopo: jison.escopo,
            tipo: jison.simbolosPreInseridos[index].tipo
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
                let escopo = resultado[`escopo_${simbolo.escopo}`];

                if(!escopo){
                    escopo = {
                        escopo: simbolo.escopo,
                        expressoes: ""
                    };

                    resultado[`escopo_${simbolo.escopo}`] = escopo;
                }

                // resultado += `======== ESCOPO ${simbolo.escopo} ========\n`;
                resultado[`escopo_${simbolo.escopo}`].expressoes += `${simboloProp.substring(0, simboloProp.indexOf('_'))} ATTR `;

                let tipoValorSimbolo = jison.obterTipoValorSimbolo(simboloProp);

                resultado[`escopo_${simbolo.escopo}`].expressoes += ";\n";

                // resultado += "\n\n\n";

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
        if (simbolo.valor == null || typeof (simbolo.valor) === 'string' && simbolo.token.indexOf('_LITERAL') >= 0) {
            if(simbolo.valor == null){

                resultado[`escopo_${simbolo.escopo}`].expressoes += simboloName.substring(0, simboloName.indexOf('_'));
            }
            else{
                resultado[`escopo_${simbolo.escopo}`].expressoes += simbolo.valor;
            }
            return simbolo.tipo;
        }
        else if (typeof (simbolo.valor) === 'object') {
            if (simbolo.valor.oper === 'LIT') {
                return jison.obterTipoValorSimbolo(simbolo.valor.value + "_" + simbolo.escopo);
            }
            else {

                let tipoLeft = jison.obterTipoValorSimbolo(simbolo.valor.left.value + "_" + simbolo.escopo);
                resultado[`escopo_${simbolo.escopo}`].expressoes += ` ${simbolo.valor.oper} `;
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
        escreverArquivo();
        console.log(srcName + ' is a valid code!');
    } catch (error) {
        console.log(srcName + ' is a invalid code:\n');
        console.log(error.toString());
    }
};

var escreverArquivo = function(){
    let temp = "";
    for (let scope in resultado) {
        let tempScope = resultado[scope];
        temp += `======== ESCOPO ${tempScope.escopo} ========\n`;
        temp += tempScope.expressoes;
        temp += "\n\n\n";
    }

    fs.writeFileSync("result/codigoIntermediario.txt", temp);
};

sintaticParser(sourceSuccess, "sourceTestSuccess");