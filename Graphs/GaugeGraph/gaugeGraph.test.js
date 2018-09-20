import React from 'react';
import { mount } from 'enzyme';

import { getInnerHtml, getDataAndConfig } from '../testHelper';
import GaugeGraph from '.';

describe("GaugeGraph", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('GaugeGraph');
    });

    describe("positive-data-configuration", () => {
        let gaugeGraph, $;
        beforeAll(async () => {
            gaugeGraph = mount(<GaugeGraph width={500} height={500} configuration={config.configuration} data={config.data}> </GaugeGraph>);
            $ = getInnerHtml(gaugeGraph, 'svg');
        });

        it("SVG", () => {
            const svgHeight = $('svg').attr('height');
            const svgWidth = $('svg').attr('width');
            expect(svgHeight).toEqual("500");
            expect(svgWidth).toEqual("500");
        });

        it("Number of GaugeGraph", () => {
            const noOfGraphs = $('svg').find('g').find('g').find('path').length;
            expect(noOfGraphs).toBe(10)
        });

        it("Check the GaugeGraph", () => {
            const noOfGraphs = $('svg').find('g').find('g').find('path').attr("d");
            expect(noOfGraphs).toEqual("M-230,-2.8166876380389125e-14A230,230,0,0,1,-218.7429987478853,-71.07390870623793L-190.2113032590307,-61.803398874989504A200,200,0,0,0,-200,-2.4492935982947064e-14Z");
        });

        it("Check the GaugeGraph transform", () => {
            const noOfGraphs = $('svg').find('g').find('g').find('text').attr("transform");
            expect(noOfGraphs).toEqual("rotate(-90) translate(0, -235)");
        });
    });
});
