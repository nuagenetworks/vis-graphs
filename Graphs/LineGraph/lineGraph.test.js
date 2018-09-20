import React from 'react';
import {mount} from 'enzyme';

import {getInnerHtml,getDataAndConfig} from '../testHelper';
import LineGraph from '.'; 

const cheerio = require('cheerio');

describe ("LineGraph", ()=>{
    let config;
    beforeAll( async () => {
        config = await getDataAndConfig('LineGraph');     
    });

    describe("multipleLines", ()=>{
        let multiline, $;
        beforeAll( async () => { 
            multiline = mount(
                <LineGraph 
                    width={500} 
                    height={500} 
                    configuration={config.multiline} 
                    data={config.data}> 
                </LineGraph>
            );
           $ = getInnerHtml(multiline,'svg');;
        });

        it("svg", ()=>{
            const svgHeight = $('svg').attr('height');
            const svgWidth = $('svg').attr('width');
            expect(svgHeight).toEqual("500");
            expect(svgWidth).toEqual("500");
        }); 

        it("Number of LineGraph", ()=>{
            const noOfLines = $('svg').find('g').get(1).firstChild.nextSibling.nextSibling.children.length;
            expect(noOfLines).toBe(3)
        });

        it("Check xAxis ticks", ()=>{
            const xAxisTicks = $('svg').find('g').get(1).firstChild.children.length;
            expect(xAxisTicks).toBe(11);
        });
    
        it("Check yAxis ticks", ()=>{
            const yAxisTicks = $('svg').find('g').get(1).firstChild.nextSibling.children.length;
            expect(yAxisTicks).toBe(6);
        });

        it("Check line", ()=>{
            const linePath = $('svg').find('g').get(1).firstChild.nextSibling.nextSibling.children;
            const line = cheerio.load(linePath);
            const d = line('path').attr('d');
            expect(d).toEqual("M0,400.6363636363636L142.6451612903226,323.5909090909091L272.3225806451613,374.95454545454544L402,118.13636363636363");
        }); 
        
    });   

    describe("simple-lineGraph", ()=>{
        let simpleLine, $;
        beforeAll( async () => { 
            simpleLine = mount(
                <LineGraph 
                    width={500} 
                    height={500} 
                    configuration={config.multiline} 
                    data={config.data}> 
                </LineGraph>
            );
           $ = getInnerHtml(simpleLine,'svg');;
        });

        it("test svg", ()=>{
            const svgHeight = $('svg').attr('height');
            const svgWidth = $('svg').attr('width');
            expect(svgHeight).toEqual("500");
            expect(svgWidth).toEqual("500");
        }); 

        it("number of LineGraph is matched", ()=>{
            const noOfLines = $('svg').find('g').get(1).firstChild.nextSibling.nextSibling.children.length;
            expect(noOfLines).toBe(3)
        });

        it("check xAxis ticks", ()=>{
            const xAxisTicks = $('svg').find('g').get(1).firstChild.children.length;
            expect(xAxisTicks).toBe(11);
        });
    
        it("check yAxis ticks", ()=>{
            const yAxisTicks = $('svg').find('g').get(1).firstChild.nextSibling.children.length;
            expect(yAxisTicks).toBe(6);
        });

        it("Check line", ()=>{
            const linePath = $('svg').find('g').get(1).firstChild.nextSibling.nextSibling.children;
            const line = cheerio.load(linePath);
            const d = line('path').attr('d');
            expect(d).toEqual("M0,400.6363636363636L142.6451612903226,323.5909090909091L272.3225806451613,374.95454545454544L402,118.13636363636363");
        }); 
        
    });  
});
