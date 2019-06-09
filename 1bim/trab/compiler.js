var fs = require("fs");
var jison = require("jison");

jison.escopo = 1;
jison.tabelaSimbolo = [

];

jison.inserirSimbolo = function(lexema, token, categoria, tipo, valor, escopo, utilizada){
    let simbolo = [];
    simbolo['lexema'] = lexema;
    simbolo['token'] = token;
    simbolo['categoria'] = categoria;
    simbolo['tipo'] = tipo;
    simbolo['valor'] = valor;
    simbolo['escopo'] = escopo;
    simbolo['utilizada'] = utilizada;

    jison.tabelaSimbolo.push(simbolo);
};

var grammar = JSON.parse(fs.readFileSync("json/grammar.json", "utf8"));
grammar.lex = JSON.parse(fs.readFileSync("json/lex.json", "utf8"));
grammar.bnf = JSON.parse(fs.readFileSync("json/bnf.json", "utf8"));
grammar.operators = JSON.parse(fs.readFileSync("json/operators.json", "utf8"));

var sourceSuccess = fs.readFileSync("sourceTestSuccess", "utf8");
var sourceError = fs.readFileSync("sourceTestError", "utf8");

// Generate Compiler
var compiler = new jison.Parser(grammar);

var sintaticParser = function(src, srcName){
    try {
        var teste = compiler.parse(src);
        console.log(jison.escopo);
        console.log(srcName + ' is a valid code!');
    } catch (error) {
        console.log(srcName + ' is a invalid code:\n');
        console.log(error.toString());
    }  
}

sintaticParser(sourceSuccess, "sourceTestSuccess");

// sintaticParser(sourceError, "sourceTestError");