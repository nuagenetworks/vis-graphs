import React from 'react';
import { mount} from 'enzyme';

import {getInnerHtml,getDataAndConfig} from '../testHelper';
import ChordGraph from '.'; 

describe ("ChordGraph", ()=>{

    beforeAll( async () => {
            global.config = await getDataAndConfig('ChordGraph');     
    });

    describe("IntialConfiguration", ()=>{
        let chordGraph, $;
        beforeAll( async () => {
            chordGraph = mount(
                <ChordGraph 
                    width={500} 
                    height={500} 
                    configuration={config.configuration} 
                    data={config.data}> 
                </ChordGraph>
            );
            $ = getInnerHtml(chordGraph,'svg');
        });

        it("SVG", ()=>{
            const svgHeight = $('svg').attr('height');
            const svgWidth = $('svg').attr('width');
            expect(svgHeight).toEqual("500");
            expect(svgWidth).toEqual("500");
        }); 

        it("Number of ChordGraph", ()=>{
            const noOGraphs = $('svg').find('g').length;
            expect(noOGraphs).toBe(11)
        });

        it("Check ChordGraph", ()=>{
            const chordGraphDetail = $('svg').find('g').find('g').find('path').attr("d");
            expect(chordGraphDetail).toEqual("M1.2246467991473532e-14,-200A200,200,0,0,1,131.1836030421305,-150.96642770127647Q0,0,141.4213562373095,-141.42135623730948A200,200,0,0,1,199.51020005065592,-13.988569467506565Q0,0,1.2246467991473532e-14,-200Z");
        });

        it("Check ChordGraph transform", ()=>{
            const chordGraphTransform = $('svg').find('g').find('g').find('text').attr("transform");
            expect(chordGraphTransform).toEqual("rotate(-69.50535228295789)translate(230)");
        });
    });   
});
