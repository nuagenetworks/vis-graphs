import React from 'react';
import { mount } from 'enzyme';

import { getDataAndConfig } from '../testHelper';
import SimpleTextGraph from '.';

const cheerio = require('cheerio')

describe("SimpleTextGraph", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('SimpleTextGraph');
    });

    describe("withoutTitle", () => {
        let withoutTitle, simpleTextGraph, $;
        beforeAll(async () => {
            withoutTitle = mount(
                <SimpleTextGraph
                    width={500}
                    height={500}
                    configuration={config.withoutTitle}
                    data={config.data}>
                </SimpleTextGraph>
            );
            simpleTextGraph = withoutTitle.html();
            $ = cheerio.load(simpleTextGraph);
        });

        it("Title", () => {
            const text = $('div').first();
            const finalText = $(text).clone().children().remove().end().text();
            expect(finalText).toEqual('Untitled');
        });

        it("Value", () => {
            const value = $('div').last().text();
            expect(value).toEqual('1000');
        });
    });

    describe("withTitle", () => {
        let withTitle, simpleTextGraph, $;
        beforeAll(async () => {
            withTitle = mount(
                <SimpleTextGraph
                    width={500}
                    height={500}
                    configuration={config.withTitle}
                    data={config.data}>
                </SimpleTextGraph>
            );
            simpleTextGraph = withTitle.html();
            $ = cheerio.load(simpleTextGraph);
        });

        it("Title", () => {
            const text = $('div').first();
            const finalText = $(text).clone().children().remove().end().text();
            expect(finalText).toEqual('withTitle');
        });

        it("Value", () => {
            const value = $('div').last().text();
            expect(value).toEqual('1000');
        });
    });
});
