import React from 'react';
import { configure } from 'enzyme';
import ReactDOM from 'react-dom';

import { getDataAndConfig, columnStatusTextGraphData, getColor, rgbToHex } from '../testHelper';
import MultiColumnStatusTextGraph from ".";
import Adapter from 'enzyme-adapter-react-16';

const cheerio = require('cheerio');

configure({ adapter: new Adapter() });

describe('MultiColumnStatusText Graph', () => {
    let $, config;
    beforeAll(async (done) => {
        const element = document.createElement('div');
        config = await getDataAndConfig('MultiColumnStatusTextGraph');
        ReactDOM.render(
            <MultiColumnStatusTextGraph
                width={500}
                height={500}
                configuration={config.visualization}
                data={config.data}>
            </MultiColumnStatusTextGraph>,
            element
        );
        setTimeout(() => {
            done();
            $ = cheerio.load(element.innerHTML);
        }, 350);
    });

    it("columnStatusTextGraph Count", () => {
        const columnStatusTextCount = $('.inline-alarms').children().length;
        expect(columnStatusTextCount).toEqual(3);
    });

    it("First Data", () => {
        const textData = $('.inline-alarms').children().first();
        const value = columnStatusTextGraphData($, textData);
        const columnStatusText = [
            'Critical Alarms',
            '2'
        ];
        expect(columnStatusText).toEqual(value);
    });

    it("Second Data", () => {
        const textData = $('.inline-alarms').children().first().next();
        const value = columnStatusTextGraphData($, textData);
        const columnStatusText = [
            'Major Alarms',
            '1'
        ];
        expect(columnStatusText).toEqual(value);
    });

    it("Third Data", () => {
        const textData = $('.inline-alarms').children().first().next().next();
        const value = columnStatusTextGraphData($, textData);
        const columnStatusText = [
            'Minor Alarms',
            '3'
        ];
        expect(columnStatusText).toEqual(value);
    });

    it("First Data Color", () => {
        const colorData = $('.inline-alarms').children().first();
        const rbgColor = getColor($, colorData);
        const hexColor = rgbToHex(rbgColor);
        const color = config.visualization.data.colors[0];
        expect(hexColor).toEqual(color);
    });

    it("Second Data Color", () => {
        const colorData = $('.inline-alarms').children().first().next();
        const rbgColor = getColor($, colorData);
        const hexColor = rgbToHex(rbgColor);
        const color = config.visualization.data.colors[1];
        expect(hexColor).toEqual(color);
    });

    it("Third Data Color", () => {
        const colorData = $('.inline-alarms').children().first().next().next();
        const rbgColor = getColor($, colorData);
        const hexColor = rgbToHex(rbgColor);
        const color = config.visualization.data.colors[2];
        expect(hexColor).toEqual(color);
    });

});
