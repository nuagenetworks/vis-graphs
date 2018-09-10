import React from 'react';
import { mount} from 'enzyme';
import {CheckTicks,getDataAndConfig} from '../testHelper';
import PieGraph from '.'; 
const cheerio = require('cheerio');

describe ("test pieGrpah", ()=>{
    beforeAll( async () => {
            global.config = await getDataAndConfig('PieGraph');     
    });

    describe("positive-data-configuration", ()=>{
        
        beforeAll( async () => {
            global.component = mount(<PieGraph width={500} height={500} configuration={config.configuration} data={config.data}> </PieGraph>);
        });

        it("number of pieGrpah is matched", ()=>{
            const middleHtml = component.find('svg').html();
            const $ = cheerio.load(middleHtml);
            const noOfBars = $('svg').find('g').find('g').find('path').length;
            const totalBar = global.component.root.props().data.length;
            expect(noOfBars).toBe(totalBar)
        });

        it("check the pieGraph", ()=>{
            const middleHtml = component.find('svg').html();
            const $ = cheerio.load(middleHtml);
            const noOfBars = $('svg').find('g').find('g').find('path').attr("d");
            expect(noOfBars).toBeDefined();
        });

        it("check the pieGraph text", ()=>{
            const middleHtml = component.find('svg').html();
            const $ = cheerio.load(middleHtml);
            const noOfBars = $('svg').find('g').find('g').find('text').attr("transform");
            expect(noOfBars).toBeDefined();
        });
    });   
});
