import * as esprima from 'esprima';
import * as escodegen from 'escodegen';

export {createCFG};

const typeArr = ['BlockStatement','VariableDeclaration','ExpressionStatement','WhileStatement','IfStatement', 'ReturnStatement'];
let vertices = [];
let edges = [];
let index=-1;
let compress = false;
let alt = false;
let lastwhile=false;
let inIf = false;


/*const typeArr = ['VariableDeclaration','AssignmentExpression','BinaryExpression','LogicalExpression'];
//const funcArr = [varDeclHandler, assignmentHandler, doNothing, doNothing];
let params = [];
let locals = [];
let esGraph = null;

const varDeclHandler = (node) => {};
const assignmentHandler = (node) => {};
const doNothing = (node) => {};


const createCFG = (code, argsInput) =>{
    init();
    let args = eval('['.concat(argsInput,']'));
    let parsedCode = esprima.parseScript(code);
    assignParams(parsedCode.body[0].params, args);
    esGraph = esgraph(parsedCode.body[0].body)[2];
    for(let x in esGraph){
        if(esGraph[x].exception !== null){
            delete esGraph.exception;
        }
    }
    //remove entry and exit
    findPath(esGraph[0]);
    return esGraph;

};

const findPath = (flowNode) => {
    flowNode.entered = 'yes';
    let type = typeArr.indexOf(flowNode.astNode.type);
    funcArr[type]();
    flowNode.normal !== undefined ? findPath(flowNode.normal) : {};


};


const assignParams = (paramsOfFunc, args) =>{
    for(let x in paramsOfFunc){
        params.push({id: paramsOfFunc[x].name, value:[args[x]]});
    }
};*/

const init = ()=>{
    index = -1;
    vertices = [];
    edges = [];
    compress = false;
    alt = false;
    lastwhile=false;
    inIf=false;
};

const blockHandler = (node) => {
    let ret=-1;
    for(let x in node.body){
        ret=build(node.body[x]);
        alt=false;
    }
    return ret;
};
const varDeclHandler = (node) => {
    if(compress === true){
        vertices[index] = {number: vertices[index].number, content: (vertices[index].content).concat(escodegen.generate(node), '\n'), label: 'vd', color:'white'};
    }
    else{
        index = index + 1;
        compress = true;
        vertices.push({number: index, content:(escodegen.generate(node)).concat('\n'), label: 'vd', color:'white'});
    }
    lastwhile=false;
};

const assignmentHandler = (node) => {
    if(compress === true){
        vertices[index] = {number: vertices[index].number, content: (vertices[index].content).concat(escodegen.generate(node), '\n'), label: 'as', color:'white'};
    }
    else{
        index = index + 1;
        compress = true;
        vertices.push({number: index, content:(escodegen.generate(node)).concat('\n'), label: 'as', color:'white'});
    }
    lastwhile=false;

};

/*const handleCompositeIf = (test) =>{let right = test.right;let left = test.left;let opr = test.operator;
    if(opr === '&&'){
        vertices.push({number: index, content:(escodegen.generate(left)).concat('\n'), label: 'if', color:'white'});
        index=index+1;
        vertices.push({number: index, content:(escodegen.generate(right)).concat('\n'), label: 'if', color:'white'});
        //edges.push({left:index-1, right:index, type:'true'});
        //let idit = index+1;
        //edges.push({left:index, right:idit, type:'true'});
        if(alt === false && inIf === false){
            edges.push({left:index-2, right:index-1, type:'normal'});}}
    else{
        vertices.push({number: index, content:(escodegen.generate(left)).concat('\n'), label: 'if', color:'white'});
        index=index+1;
        vertices.push({number: index, content:(escodegen.generate(right)).concat('\n'), label: 'if', color:'white'});
        //edges.push({left:index-1, right:index, type:'false'});
        //let idit = index+1;
        //edges.push({left:index, right:idit, type:'false'});
        //if(alt === false && inIf === false){
        //  edges.push({left:index-2, right:index-1, type:'normal'});}
    }};*/

const ifHandler = (node) => {compress = false;let test = node.test;let dit = node.consequent;let dif = node.alternate;index = index + 1;
    let temp = index;
    /*if(test.type === 'LogicalExpression'){
        handleCompositeIf(test);
    }*/
    /*else {*/
    vertices.push({number: index, content:(escodegen.generate(test)).concat('\n'), label: 'if', color:'white'});
    if(alt === false && inIf === false){
        edges.push({left:index-1, right:index, type:'normal'});
    }
    let idit = index+1;
    edges.push({left:temp, right:idit, type:'true'});//}
    inIf=true;build(dit);let fdit = index;let fdif=-1;compress = false;
    if(dif !== undefined){alt=true;let idif = index+1;edges.push({left:temp, right:idif, type:'false'});build(dif);fdif = index;index= index+1;vertices.push({number:index, content:'',label:'mergeIf', color:'white'});edges.push({left:fdit, right:index, type:'normal'});edges.push({left:fdif, right:index, type:'normal'});}
    //else{index= index+1;vertices.push({number:index, content:'',label:'mergeIf', color:'white'});edges.push({left:fdit, right:index, type:'normal'});}
    compress = false;inIf=false;lastwhile=false;
};

const whileHandler = (node) => {compress =  false;index = index +1;let dummy = index;vertices.push({number: index, content: '', label: 'finW', color:'white'});
    //previous node
    edges.push({left:index-1,right:index,type:'normal'});
    index = index +1;
    let temp=index;
    let test = node.test;
    let body = node.body;
    /*if(test.type === 'LogicalExpression'){
        handleCompositeIf(test);}
    else {*/
    vertices.push({number: index, content:(escodegen.generate(test)).concat('\n'), label: 'if', color:'white'});
    edges.push({left:index-1,right:index,type:'normal'});//}
    let icont = index+1;
    edges.push({left:temp, right:icont, type:'true'});
    build(body);
    edges.push({left:index, right:dummy, type:'normal'});
    edges.push({left:temp, right:index+1, type:'false'});
    compress = false;
    lastwhile=true;
};

const returnHandler = (node) => {
    compress =  false;
    index = index +1;
    vertices.push({number: index, content: escodegen.generate(node), label: 'ret', color:'white'});
    if(!lastwhile){
        edges.push({left:index-1, right:index, type:'normal'});
    }
};

const funcArr = [blockHandler, varDeclHandler, assignmentHandler, whileHandler, ifHandler, returnHandler];
const build = (ast) => {
    if(ast.constructor === Array) {
        let ret;
        for (let x in ast) {
            let idx = typeArr.indexOf(ast[x].type);
            ret=funcArr[idx](ast[x]);
        }
        return ret;
    }
    else {
        let idx = typeArr.indexOf(ast.type);
        return funcArr[idx](ast);
    }
};

const getGlobalsAndFunc = (ast)=>{
    let body  = ast.body;
    let ret = {func:null, globals:[]};
    for(let x in body){
        if(body[x].type==='FunctionDeclaration'){ret.func=body[x];break;}
        else ret.globals.push(body[x]);
    }
    return ret;
};

const createCFG = (code, argsInput) =>{
    init();
    let args = eval('['.concat(argsInput,']'));
    let parsedCode = esprima.parseScript(code);
    let map = getGlobalsAndFunc(parsedCode);
    let stringOfParams = assignParams(map.func.params, args);
    if(map.globals.length !== 0){
        build(map.globals);
        edges.push({left:index,right:index+1,type:'normal'});
        compress=false;
    }
    build(map.func.body);
    addColorToEdges(stringOfParams);
    return {nodes:vertices, links:edges};
};



const addColorToEdges = (stringOfParams) =>{
    let cont=true;let curr=0;let toeval = stringOfParams;toeval = toeval.concat(vertices[0].content);
    vertices[0].color = 'green';
    let next = getNextVertice(curr, 'normal');
    while(cont){
        let nextVertice = getVertice(next);
        greenV(next);
        let ret;
        let s='';
        if(nextVertice.label === 'if'){
            ret = eval(toeval.concat(nextVertice.content, ';'));
            if(ret===true){s='true';}
            else{s='false';}
        }
        else if(nextVertice.label === 'ret'){cont=false;break;}
        else{s='normal'; toeval = toeval.concat(nextVertice.content);}
        next= getNextVertice(nextVertice.number, s);
    }

};
const greenV = (num) => {
    let cont=true;
    for(let i=0; cont === true && i<vertices.length ; i++ ){
        if(vertices[i].number === num){
            cont=false;
            vertices[i].color = 'green';
        }
    }

};
const getVertice = (num) => {
    let cont=true;
    let ret=null;
    for(let i=0; cont === true && i<vertices.length ; i++ ){
        if(vertices[i].number === num){
            cont=false;
            ret=vertices[i];
        }
    }
    return ret;

};
const getNextVertice = (num, str) => {
    let cont=true;
    let ret=-1;
    for(let i=0; cont === true && i<edges.length ; i++ ){
        if(edges[i].left === num && edges[i].type === str){
            cont=false;
            ret=edges[i].right;
        }
    }
    return ret;

};
const assignParams = (paramsOfFunc, args) =>{
    let ret = '';
    for(let x in paramsOfFunc){
        ret = ret.concat('let ' + paramsOfFunc[x].name + ' = ' + args[x] + ';\n');
    }
    return ret;
};

