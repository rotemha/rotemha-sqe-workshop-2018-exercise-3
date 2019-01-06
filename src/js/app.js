import $ from 'jquery';
let d3 = require('d3-graphviz');

import {createCFG} from './code-analyzer';
let vertices=null;
let edges = null;
$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let code = $('#codePlaceholder').val();
        let args = $('#argsPlaceHolder').val();
        let cfg = createCFG(code,args);
        vertices = cfg.nodes;
        edges = cfg.links;
        // console.log(JSON.stringify(cfg.nodes));
        //console.log(JSON.stringify(cfg.links));
        let nodes = formalizeVertices();
        let kashets = formalizeEdges();
        let dotted = 'digraph {'+ nodes.concat(kashets) +'}';
        let visualiser = d3.graphviz('#graph');
        visualiser.dot(dotted).render();
    });
});

const findShape = (i) => {
    if(vertices[i].label === 'if'){return 'diamond';}
    else if(vertices[i].label === 'mergeIf' || vertices[i].label === 'finW'){return '';}
    else {return 'box';}
};

const formalizeEdges = () => {
    let ret = '';
    for(let i=0; i<edges.length;i++){
        if(edges[i].type!=='normal'){
            ret = ret.concat('n', edges[i].left, ' -> n',edges[i].right,' [label="',edges[i].type,'"]\n');
        }
        else{
            ret = ret.concat('n', edges[i].left, ' -> n',edges[i].right,' [label=""]\n');
        }
    }
    return ret;
};

const formalizeVertices = () => {
    let ret = '';
    for(let i=0; i<vertices.length;i++){
        let shape = findShape(i);
        if(shape!=='') {
            ret = ret.concat('n', vertices[i].number, ' [shape=', shape, ', style=filled, fillcolor= ', vertices[i].color, ', label= "', vertices[i].content, '" ]\n');
        }
        else{
            ret = ret.concat('n', vertices[i].number, ' [style=filled, fillcolor= ', vertices[i].color, ', label= "', vertices[i].content, '" ]\n');
        }
    }
    return ret;
};
