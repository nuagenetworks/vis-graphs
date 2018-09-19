import React from 'react';
import { mount} from 'enzyme';

import {getDataAndConfig} from '../testHelper';
import PieGraph from '.'; 

const cheerio = require('cheerio');

describe ("PieGrpah", ()=>{
    let config;
    beforeAll( async () => {
        config = await getDataAndConfig('PieGraph');     
    });

    describe("positive-data-configuration", ()=>{
        let pieGraph,svg,$;
        beforeAll( async () => {
            pieGraph = mount(
                <PieGraph 
                    width={500} 
                    height={500} 
                    configuration={config.configuration} 
                    data={config.data}> 
                </PieGraph>
            );
            svg = pieGraph.find('svg').html();
            $ = cheerio.load(svg);
        });

        it("svg", ()=>{
            const svgHeight = $('svg').attr('height');
            const svgWidth = $('svg').attr('width');
            expect(svgHeight).toEqual("500");
            expect(svgWidth).toEqual("500");
        }); 

        it("Number of pieGrpah", ()=>{
            const noOfGraphs = $('svg').find('g').find('g').find('path').length;
            const totalGraph = pieGraph.root.props().data.length;
            expect(noOfGraphs).toBe(totalGraph)
        });

        it("Check pieGraph", ()=>{
            const noOfGraphs = $('svg').find('g').find('g').find('path').attr("d");
            console.log(noOfGraphs);
            expect(noOfGraphs).toBeDefined();
        });

        it("Check pieGraph transform", ()=>{
            const graphTransform = $('svg').find('g').find('g').find('text').attr("transform");
            console.log(graphTransform);
            expect(graphTransform).toBeDefined();
        });

        it("Check pieGraph text", () =>{
            const graphTransform = $('svg').find('g').find('g').find('text').first().text();
            expect(graphTransform).toEqual("48.1%");
        })
    });   
});
