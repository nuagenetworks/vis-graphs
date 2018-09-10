import React from 'react';
import {mount} from 'enzyme';
import {CheckTicks,getDataAndConfig} from '../testHelper';
import BarGraph from '.'; 
const cheerio = require('cheerio')

describe ("test barGrpah", ()=>{
    beforeAll( async () => {
            global.config = await getDataAndConfig('DynamicBarGraph');     
    });

    describe("positive-data-horizontal-number", ()=>{
        
        beforeAll( async () => {
            global.componenthorizontal = mount(<BarGraph width={500} height={500} configuration={config.horizontal} data={config.data}> </BarGraph>);
        });

        it("number of barGraph is matched", ()=>{
            const middleHtml = componenthorizontal.find('.graph-bars').html();
            const $ = cheerio.load(middleHtml);
            const noOfBars = $('.graph-bars').find('g').length;
            const totalBar = global.componenthorizontal.root.props().configuration.data.otherOptions.limit + 1;
            expect(noOfBars).toBe(totalBar)
        });

        it("check xAxis ticks", ()=>{
            const xAxisTicks = CheckTicks(componenthorizontal,'.graph-container','.xAxis','g')
            expect(xAxisTicks).toBeGreaterThan(0);
        });
    
        it("check yAxis ticks", ()=>{
            const yAxisTicks = CheckTicks(componenthorizontal,'.graph-container','.yAxis','g')
            expect(yAxisTicks).toBeGreaterThan(0);
        });
        
    });   

    describe("vertical-percentage", ()=>{
        beforeAll( async () => {
            global.componentVertical = mount(<BarGraph width={500} height={500} configuration={config.vertical} data={config.data}> </BarGraph>); 
        });

        it("number of barGraph is matched", ()=>{
            const middleHtml = componentVertical.find('.graph-bars').html();
            const $ = cheerio.load(middleHtml);
            const noOfBars = $('.graph-bars').find('g').length;
            expect(noOfBars).toBe(11)
        });

        it("check xAxis ticks", ()=>{
            const xAxisTicks = CheckTicks(componentVertical,'.graph-container','.xAxis','g')
            expect(xAxisTicks).toBeGreaterThan(0);
        });
    
        it("check yAxis ticks", ()=>{
            const yAxisTicks = CheckTicks(componentVertical,'.graph-container','.yAxis','g')
            expect(yAxisTicks).toBeGreaterThan(0);
        });
        
    });  

    describe("vertical-without-brush", ()=>{

        beforeAll( async () => {
            global.componentSimple = mount(<BarGraph width={500} height={500} configuration={config.withoutBrush} data={config.data}> </BarGraph>); 
        });

        it("test case for number of barGraph is matched", ()=>{
            const middleHtml = componentSimple.find('.graph-bars').html();
            const $ = cheerio.load(middleHtml);
            const noOfBars = $('.graph-bars').find('g').length;
            const totalBar = componentSimple.root.props().data.length;
            expect(noOfBars).toBe(totalBar)
        });

        it("check xAxis ticks", ()=>{
            const xAxisTicks = CheckTicks(componentSimple,'.graph-container','.xAxis','g')
            expect(xAxisTicks).toBeGreaterThan(0);
        });
    
        it("check yAxis ticks", ()=>{
            const yAxisTicks = CheckTicks(componentSimple,'.graph-container','.yAxis','g')
            expect(yAxisTicks).toBeGreaterThan(0);
        });
        
    }); 

    describe("vertical-stacked", ()=>{
        beforeAll( async () => {
            global.componentStacked = mount(<BarGraph width={500} height={500} configuration={config.stacked} data={config.data}> </BarGraph>);       
        }); 

        it("test case for number of barGraph is matched", ()=>{
            const middleHtml = componentStacked.find('.graph-bars').html();
            const $ = cheerio.load(middleHtml);
            const noOfBars = $('.graph-bars').find('g').length;
            const totalBar = componentStacked.root.props().data.length;
            expect(noOfBars).toBe(totalBar)
        });

        it("check xAxis ticks", ()=>{
            const xAxisTicks = CheckTicks(componentStacked,'.graph-container','.xAxis','g')
            expect(xAxisTicks).toBeGreaterThan(0);
        });
    
        it("check yAxis ticks", ()=>{
            const yAxisTicks = CheckTicks(componentStacked,'.graph-container','.yAxis','g')
            expect(yAxisTicks).toBeGreaterThan(0);
        });
        
    }); 

    describe("vertical-brush-number", ()=>{
        beforeAll( async () => {
            global.componentWithoutBrush = mount(<BarGraph width={500} height={500} configuration={config.brush} data={config.data}> </BarGraph>);          
        });
        
        it("test case for number of barGraph is matched", ()=>{
            const middleHtml = componentWithoutBrush.find('.graph-bars').html();
            const $ = cheerio.load(middleHtml);
            const noOfBars = $('.graph-bars').find('g').length;
            const totalBar = componentWithoutBrush.root.props().configuration.data.otherOptions.limit + 1;
            expect(noOfBars).toBe(totalBar)
        });

        it("check xAxis ticks", ()=>{
            const xAxisTicks = CheckTicks(componentWithoutBrush,'.graph-container','.xAxis','g')
            expect(xAxisTicks).toBeGreaterThan(0);
        });
    
        it("check yAxis ticks", ()=>{
            const yAxisTicks = CheckTicks(componentWithoutBrush,'.graph-container','.yAxis','g')
            expect(yAxisTicks).toBeGreaterThan(0);
        }); 
    });
});