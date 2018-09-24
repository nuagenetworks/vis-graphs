import React from 'react';
import { mount } from 'enzyme';

import { getInnerHtml, getDataAndConfig, checkTicks, checkSvg } from '../testHelper';
import AreaGraph from '.';

describe("AreaGraph", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('AreaGraph');
    });

    describe("Simple", () => {
        let simple, $;
        beforeAll(async () => {
            simple = mount(
                <AreaGraph
                    width={500}
                    height={500}
                    configuration={config.simple}
                    data={config.data}>
                </AreaGraph>
            );
            $ = getInnerHtml(simple, 'svg');
        });

        it("SVG Dimensions", () => {
            const result = checkSvg(horizontalBrush);
            expect(result).toBeTruthy();
        });

        it("Total AreaGraph", () => {
            const noOfAreaBlock = $('.area-chart').find('.area-block').length;
            const noOfLineBlock = $('.area-chart').find('.line-block').length;
            expect(noOfAreaBlock).toBe(3);
            expect(noOfLineBlock).toBe(3)
        });

        it("AreaGraph Dimensions", () => {
            const areaGraph = $('svg').find('g').find('g').find('path').attr("d");
            expect(areaGraph).toEqual("M0,452L0,245.70366128751263L55.71428571428571,347.9820953687323L111.42857142857142,328.47867409437856L167.14285714285714,236.09404700533463L222.85714285714283,41.059834261797334L278.57142857142856,184.76925417808798L334.2857142857143,328.47867409437856L390,174.50429561263866L390,452");
        });

        it("AreaGraph Legends", () => {
            const noOfLegends = $('.legend').children().length;
            expect(noOfLegends).toBe(3);
        });

        it("xAxis Ticks Length", () => {
            const xAxisTicks = checkTicks(simple, '.graph-container', '.xAxis', 'g')
            expect(xAxisTicks).toBe(15);
        });

        it("yAxis Ticks Length", () => {
            const yAxisTicks = checkTicks(simple, '.graph-container', '.yAxis', 'g');
            expect(yAxisTicks).toBe(5);
        });
    });

    describe("Stacked", () => {
        let stacked, $;
        beforeAll(async () => {
            stacked = mount(
                <AreaGraph
                    width={500}
                    height={500}
                    configuration={config.stacked}
                    data={config.data}>
                </AreaGraph>
            );
            $ = getInnerHtml(stacked, 'svg');
        });

        it("SVG Dimensions", () => {
            const result = checkSvg(horizontalBrush);
            expect(result).toBeTruthy();
        });

        it("Total AreaGraph", () => {
            const noOfAreaBlock = $('.area-chart').find('.area-block').length;
            const noOfLineBlock = $('.area-chart').find('.line-block').length;
            expect(noOfAreaBlock).toBe(3);
            expect(noOfLineBlock).toBe(3)
        });

        it("AreaGraph Dimensions", () => {
            const areaGraph = $('svg').find('g').find('g').find('path').attr("d");
            expect(areaGraph).toEqual("M0,227.60865963879453L0,152.46255946260334L55.71428571428571,335.77508224874737L111.42857142857142,291.279275135606L167.14285714285714,164.14839766948785L222.85714285714283,40.75666365825555L278.57142857142856,164.1483976694878L334.2857142857143,283.8009882258343L390,149.1918238499445L390,250.2732106089096");
        });

        it("AreaGraph Legends", () => {
            const noOfLegends = $('.legend').children().length;
            expect(noOfLegends).toBe(3);
        });

        it("xAxis Ticks Length", () => {
            const xAxisTicks = checkTicks(stacked, '.graph-container', '.xAxis', 'g')
            expect(xAxisTicks).toBe(15);
        });

        it("yAxis Ticks Length", () => {
            const yAxisTicks = checkTicks(stacked, '.graph-container', '.yAxis', 'g');
            expect(yAxisTicks).toBe(5);
        });
    });
});
