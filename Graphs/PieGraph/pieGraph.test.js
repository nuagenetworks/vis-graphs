import React from 'react';
import { mount } from 'enzyme';

import { getDataAndConfig, getHtml, checkSvg } from '../testHelper';
import PieGraph from '.';

const cheerio = require('cheerio');

describe("PieGrpah", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('PieGraph');
    });

    describe("OtherOption by Number", () => {
        let pieGraph, svg, $;
        beforeAll(async () => {
            pieGraph = mount(
                <PieGraph
                    width={500}
                    height={500}
                    configuration={config.number}
                    data={config.data}>
                </PieGraph>
            );
            $ = getHtml(pieGraph, 'svg');
        });

        it("SVG Dimensions", () => {
            const result = checkSvg(pieGraph);
            expect(result).toBeTruthy();
        });

        it("Total PieGrpah", () => {
            const noOfGraphs = $('svg').find('g').find('g').find('path').length;
            const totalGraph = pieGraph.root.props().data.length;
            expect(noOfGraphs).toBe(totalGraph)
        });

        it("PieGraph Dimension", () => {
            const noOfGraphs = $('svg').find('g').find('g').find('path').attr("d");
            expect(noOfGraphs).toEqual("M1.2913900497008838e-14,-210.89999999999998A210.89999999999998,210.89999999999998,0,0,1,24.885148067305323,209.42669219960544L0,0Z");
        });

        it("PieGraph Transform", () => {
            const graphTransform = $('svg').find('g').find('g').find('text').attr("transform");
            expect(graphTransform).toEqual("translate(121.88657154710538,-7.216209288287419)");
        });

        it("PieGraph Label", () => {
            const graphTransform = $('svg').find('g').find('g').find('text').first().text();
            expect(graphTransform).toEqual("48.1%");
        });

        it("Number of Legends", () => {
            const legend = $('svg').find('g').get(0).nextSibling.children.length;
            expect(legend).toBe(4);
        });

        it("Legends Label", () => {
            const legend = $('svg').find('g').last().find('text').text();
            expect(legend).toEqual("0 Hendrerit lectus.");
        });
    });

    describe("OtherOption by Percentage", () => {
        let pieGraph, svg, $;
        beforeAll(async () => {
            pieGraph = mount(
                <PieGraph
                    width={500}
                    height={500}
                    configuration={config.percentage}
                    data={config.data}>
                </PieGraph>
            );
            $ = getHtml(pieGraph, 'svg');
        });

        it("SVG Dimensions", () => {
            const result = checkSvg(pieGraph);
            expect(result).toBeTruthy();
        });

        it("Total PieGrpah", () => {
            const noOfGraphs = $('svg').find('g').find('g').find('path').length;
            const totalGraph = pieGraph.root.props().data.length;
            expect(noOfGraphs).toBe(totalGraph)
        });

        it("PieGraph Dimension", () => {
            const noOfGraphs = $('svg').find('g').find('g').find('path').attr("d");
            expect(noOfGraphs).toEqual("M1.2913900497008838e-14,-210.89999999999998A210.89999999999998,210.89999999999998,0,0,1,24.885148067305323,209.42669219960544L0,0Z");
        });

        it("PieGraph Transform", () => {
            const graphTransform = $('svg').find('g').find('g').find('text').attr("transform");
            expect(graphTransform).toEqual("translate(121.88657154710538,-7.216209288287419)");
        });

        it("PieGraph Label", () => {
            const graphTransform = $('svg').find('g').find('g').find('text').first().text();
            expect(graphTransform).toEqual("48.1%");
        });

        it("Number of Legends", () => {
            const legend = $('svg').find('g').get(0).nextSibling.children.length;
            expect(legend).toBe(4);
        });

        it("Legends Label", () => {
            const legend = $('svg').find('g').last().find('text').text();
            expect(legend).toEqual("0 Hendrerit lectus.");
        });
    });

    describe("Without OtherOption", () => {
        let pieGraph, svg, $;
        beforeAll(async () => {
            pieGraph = mount(
                <PieGraph
                    width={500}
                    height={500}
                    configuration={config.withoutOtherOption}
                    data={config.data}>
                </PieGraph>
            );
            $ = getHtml(pieGraph, 'svg');
        });

        it("SVG Dimensions", () => {
            const result = checkSvg(pieGraph);
            expect(result).toBeTruthy();
        });

        it("Total PieGrpah", () => {
            const noOfGraphs = $('svg').find('g').find('g').find('path').length;
            const totalGraph = pieGraph.root.props().data.length;
            expect(noOfGraphs).toBe(totalGraph)
        });

        it("PieGraph Dimension", () => {
            const noOfGraphs = $('svg').find('g').find('g').find('path').attr("d");
            expect(noOfGraphs).toEqual("M1.2913900497008838e-14,-210.89999999999998A210.89999999999998,210.89999999999998,0,0,1,24.885148067305323,209.42669219960544L0,0Z");
        });

        it("PieGraph Transform", () => {
            const graphTransform = $('svg').find('g').find('g').find('text').attr("transform");
            expect(graphTransform).toEqual("translate(121.88657154710538,-7.216209288287419)");
        });

        it("PieGraph Label", () => {
            const graphTransform = $('svg').find('g').find('g').find('text').first().text();
            expect(graphTransform).toEqual("48.1%");
        });

        it("Number of Legends", () => {
            const legend = $('svg').find('g').get(0).nextSibling.children.length;
            expect(legend).toBe(4);
        });

        it("Legends Label", () => {
            const legend = $('svg').find('g').last().find('text').text();
            expect(legend).toEqual("0 Hendrerit lectus.");
        });
    });
});
