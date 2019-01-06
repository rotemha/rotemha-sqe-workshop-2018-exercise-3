import assert from 'assert';
import {createCFG} from '../src/js/code-analyzer';

describe('The javascript parser', () => {
    it('is parsing an empty function correctly', () => {
        assert.equal(JSON.stringify(createCFG('function foo(x, y, z){\n' +
                '    let a = x + 1;\n' +
                '    let b = a + y;\n' +
                '    let c = 0;\n' +
                '    \n' +
                '    if (b < z) {\n' +
                '        c = c + 5;\n' +
                '    } else if (b < z * 2) {\n' +
                '        c = c + x + 5;\n' +
                '    } else {\n' +
                '        c = c + z + 5;\n' +
                '    }\n' +
                '    \n' +
                '    return c;\n' +
                '}\n','1, 2, 3')),
        JSON.stringify({nodes: [{"number":0,"content":"let a = x + 1;\nlet b = a + y;\nlet c = 0;\n","label":"vd","color":"green"},{"number":1,"content":"b < z\n","label":"if","color":"green"},{"number":2,"content":"c = c + 5;\n","label":"as","color":"white"},{"number":3,"content":"b < z * 2\n","label":"if","color":"green"},{"number":4,"content":"c = c + x + 5;\n","label":"as","color":"green"},{"number":5,"content":"c = c + z + 5;\n","label":"as","color":"white"},{"number":6,"content":"","label":"mergeIf","color":"green"},{"number":7,"content":"","label":"mergeIf","color":"green"},{"number":8,"content":"return c;","label":"ret","color":"green"}],links:[{"left":0,"right":1,"type":"normal"},{"left":1,"right":2,"type":"true"},{"left":1,"right":3,"type":"false"},{"left":3,"right":4,"type":"true"},{"left":3,"right":5,"type":"false"},{"left":4,"right":6,"type":"normal"},{"left":5,"right":6,"type":"normal"},{"left":2,"right":7,"type":"normal"},{"left":6,"right":7,"type":"normal"},{"left":7,"right":8,"type":"normal"}]})
        );
    });

    it('is parsing a simple variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(createCFG('function foo(x, y, z){\n' +
                '   let a = x + 1;\n' +
                '   let b = a + y;\n' +
                '   let c = 0;\n' +
                'c=9;\n' +
                '   \n' +
                '   while (a < z) {\n' +
                '       a++;\n' +
                '   }\n' +
                '   \n' +
                '   return z;\n' +
                '}\n','1, 2, 3')),
            JSON.stringify({nodes:[{"number":0,"content":"let a = x + 1;\nlet b = a + y;\nlet c = 0;\nc = 9;\n","label":"as","color":"green"},{"number":1,"content":"","label":"finW","color":"green"},{"number":2,"content":"a < z\n","label":"if","color":"green"},{"number":3,"content":"a++;\n","label":"as","color":"green"},{"number":4,"content":"return z;","label":"ret","color":"green"}], links:[{"left":0,"right":1,"type":"normal"},{"left":1,"right":2,"type":"normal"},{"left":2,"right":3,"type":"true"},{"left":3,"right":1,"type":"normal"},{"left":2,"right":4,"type":"false"}]})
        );
    });
    it('is parsing a variable declaration correctly', () => {
        assert.equal(
            JSON.stringify(createCFG('let v=9;\n' +
                'v=7;\n' +
                'function foo(x, y, z){\n' +
                '   let a = x + 1;\n' +
                '   \n' +
                '   while (a < z) {\n' +
                '       a++;\n' +
                '   }\n' +
                '   \n' +
                '   return z;\n' +
                '}\n','1, 2, 3')),
            JSON.stringify({nodes:[{"number":0,"content":"let v = 9;\nv = 7;\n","label":"as","color":"green"},{"number":1,"content":"let a = x + 1;\n","label":"vd","color":"green"},{"number":2,"content":"","label":"finW","color":"green"},{"number":3,"content":"a < z\n","label":"if","color":"green"},{"number":4,"content":"a++;\n","label":"as","color":"green"},{"number":5,"content":"return z;","label":"ret","color":"green"}], links:[{"left":0,"right":1,"type":"normal"},{"left":1,"right":2,"type":"normal"},{"left":2,"right":3,"type":"normal"},{"left":3,"right":4,"type":"true"},{"left":4,"right":2,"type":"normal"},{"left":3,"right":5,"type":"false"}]})
        );
    });
});
