import React from 'react';
import { mount } from 'enzyme';

import { getHtml, getDataAndConfig, checkSvg } from '../testHelper';
import GaugeGraph from '.';

describe("GaugeGraph", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('GaugeGraph');
    });

    describe("Initial Configurations", () => {
        let gaugeGraph, $;
        beforeAll(async () => {
            gaugeGraph = mount(
                <GaugeGraph 
                    width={500} 
                    height={500} 
                    configuration={config.configuration} 
                    data={config.data}> 
                </GaugeGraph>
            );
            $ = getHtml(gaugeGraph, 'svg');
        });

        it("SVG Dimensions", () => {
            const result = checkSvg(gaugeGraph);
            expect(result).toBeTruthy();
        });

        it("Total GaugeGraph", () => {
            const noOfGraphs = $('svg').find('g').find('g').find('path').length;
            expect(noOfGraphs).toBe(10)
        });

        it("GaugeGraph Path Definition", () => {
            const pathDefinition = $('svg').find('g').find('g').find('path').attr("d");
            expect(pathDefinition).toEqual("M-230,-2.8166876380389125e-14A230,230,0,0,1,-218.7429987478853,-71.07390870623793L-190.2113032590307,-61.803398874989504A200,200,0,0,0,-200,-2.4492935982947064e-14Z");
        });

        it("GaugeGraph Transform", () => {
            const transform = $('svg').find('g').find('g').find('text').attr("transform");
            expect(transform).toEqual("rotate(-90) translate(0, -235)");
        });

        it("GaugeGraph Needle path Definition", () => {
            const needle = $('svg').find('g').find('path').last().attr("d");
            expect(needle).toEqual("M5,0C3.333333333333333,-108,1.6666666666666667,-216,0,-216C-1.6666666666666667,-216,-3.333333333333333,0,-5,0C-3.333333333333333,0,-1.6666666666666667,5,0,5C1.6666666666666667,5,3.333333333333333,2.5,5,0");
        });

        it("GaugeGraph Needle Transform", () => {
            const needle = $('svg').find('g').find('path').last().attr("transform");
            expect(needle).toEqual("rotate(-90)");
        });
    });
});
