import React from 'react';
import { mount, configure } from 'enzyme';

import { getHtml, getDataAndConfig, checkSvg, checkLine } from '../testHelper';
import LineGraph from '.';
import Adapter from 'enzyme-adapter-react-16';

const cheerio = require('cheerio');

configure({ adapter: new Adapter() });

describe("LineGraph", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('LineGraph');
    });

    describe("Multi Lines", () => {
        let multiline, $;
        beforeAll(async () => {
            multiline = mount(
                <LineGraph
                    width={500}
                    height={500}
                    configuration={config.multiline}
                    data={config.data}>
                </LineGraph>
            );
            $ = getHtml(multiline, 'svg');;
        });

        it("SVG Dimensions", () => {
            const result = checkSvg(multiline);
            expect(result).toBeTruthy();
        });

        it("Total LineGraph", () => {
            const noOfLines = $('svg').find('g').get(1).firstChild.nextSibling.nextSibling.children.length;
            expect(noOfLines).toBe(3)
        });

        it("xAxis Ticks Length", () => {
            const xAxisTicks = $('svg').find('g').get(1).firstChild.children.length;
            expect(xAxisTicks).toBe(11);
        });

        it("yAxis Ticks Length", () => {
            const yAxisTicks = $('svg').find('g').get(1).firstChild.nextSibling.children.length;
            expect(yAxisTicks).toBe(6);
        });

        it("First Line", () => {
            const line = checkLine($, 'first');
            expect(line).toEqual("M0,400.6363636363636L142.6451612903226,323.5909090909091L272.3225806451613,374.95454545454544L402,118.13636363636363");
        });

        it("Second Line", () => {
            const line = checkLine($, 'second');
            expect(line).toEqual("M0,323.5909090909091L142.6451612903226,195.1818181818182L272.3225806451613,41.09090909090912L402,169.5");
        });

        it("Number of Legends", () => {
            const legend = $('svg').find('g').get(1).nextSibling.children.length;
            expect(legend).toBe(3);
        });

    });

    describe("Simple LineGraph", () => {
        let simpleLine, $;
        beforeAll(async () => {
            simpleLine = mount(
                <LineGraph
                    width={500}
                    height={500}
                    configuration={config.simple}
                    data={config.data}>
                </LineGraph>
            );
            $ = getHtml(simpleLine, 'svg');;
        });

        it("SVG Dimensions", () => {
            const result = checkSvg(simpleLine);
            expect(result).toBeTruthy();
        });

        it("Total LineGraph", () => {
            const noOfLines = $('svg').find('g').get(1).firstChild.nextSibling.nextSibling.children.length;
            expect(noOfLines).toBe(1)
        });

        it("xAxis Ticks Length", () => {
            const xAxisTicks = $('svg').find('g').get(1).firstChild.children.length;
            expect(xAxisTicks).toBe(11);
        });

        it("yAxis Ticks Length", () => {
            const yAxisTicks = $('svg').find('g').get(1).firstChild.nextSibling.children.length;
            expect(yAxisTicks).toBe(5);
        });

        it("First Line", () => {
            const line = checkLine($, 'first');
            expect(line).toEqual("M0,388.7832167832168L149.03225806451613,293.958041958042L284.51612903225805,357.1748251748252L420,41.09090909090912");
        });

        it("Number of Legends", () => {
            const legend = $('svg').find('g').get(1).nextSibling.children.length;
            expect(legend).toBe(1);
        });
    });

    describe("simple LineGraph With Ycolumn ", () => {
        let ycolumn, $;
        beforeAll(async () => {
            ycolumn = mount(
                <LineGraph
                    width={500}
                    height={500}
                    configuration={config.simpleYcolumn}
                    data={config.data}>
                </LineGraph>
            );
            $ = getHtml(ycolumn, 'svg');;
        });

        it("SVG Dimensions", () => {
            const result = checkSvg(ycolumn);
            expect(result).toBeTruthy();
        });

        it("Total LineGraph", () => {
            const noOfLines = $('svg').find('g').get(1).firstChild.nextSibling.nextSibling.children.length;
            expect(noOfLines).toBe(1)
        });

        it("xAxis Ticks Length", () => {
            const xAxisTicks = $('svg').find('g').get(1).firstChild.children.length;
            expect(xAxisTicks).toBe(11);
        });

        it("yAxis Ticks Length", () => {
            const yAxisTicks = $('svg').find('g').get(1).firstChild.nextSibling.children.length;
            expect(yAxisTicks).toBe(5);
        });

        it("First Line", () => {
            const line = checkLine($, 'first');
            expect(line).toEqual("M0,445.9741367817624L149.03225806451613,436.93534195440606L284.51612903225805,442.96120517264364L420,412.8318890814558");
        });

        it("Number of Legends", () => {
            const legend = $('svg').find('g').get(1).nextSibling.children.length;
            expect(legend).toBe(1);
        });

        it("Straight Line", () => {
            const straightLine = $('svg').find('g').next().get(3).children.length;
            expect(straightLine).toBe(2);
        });
    });

    describe("Multi Line LineGraph With Ycolumn ", () => {
        let multilineYcolumn, $;
        beforeAll(async () => {
            multilineYcolumn = mount(
                <LineGraph
                    width={500}
                    height={500}
                    configuration={config.multilineYcolumn}
                    data={config.data}>
                </LineGraph>
            );
            $ = getHtml(multilineYcolumn, 'svg');;
        });

        it("SVG Dimensions", () => {
            const result = checkSvg(multilineYcolumn);
            expect(result).toBeTruthy();
        });

        it("Total LineGraph", () => {
            const noOfLines = $('svg').find('g').get(1).firstChild.nextSibling.nextSibling.children.length;
            expect(noOfLines).toBe(3)
        });

        it("xAxis Ticks Length", () => {
            const xAxisTicks = $('svg').find('g').get(1).firstChild.children.length;
            expect(xAxisTicks).toBe(11);
        });

        it("yAxis Ticks Length", () => {
            const yAxisTicks = $('svg').find('g').get(1).firstChild.nextSibling.children.length;
            expect(yAxisTicks).toBe(6);
        });

        it("First Line", () => {
            const line = checkLine($, 'first');
            expect(line).toEqual("M0,400.6363636363636L142.6451612903226,323.5909090909091L272.3225806451613,374.95454545454544L402,118.13636363636363");
        });

        it("Second Line", () => {
            const line = checkLine($, 'second');
            expect(line).toEqual("M0,323.5909090909091L142.6451612903226,195.1818181818182L272.3225806451613,41.09090909090912L402,169.5");
        });

        it("Number of Legends", () => {
            const legend = $('svg').find('g').get(1).nextSibling.children.length;
            expect(legend).toBe(3);
        });

        it("Straight Line", () => {
            const straightLine = $('svg').find('g').next().get(3).children.length;
            expect(straightLine).toBe(2);
        });
    });
});
