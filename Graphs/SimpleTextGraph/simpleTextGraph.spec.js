import React from 'react';
import { mount, configure } from 'enzyme';
import ReactDOM from 'react-dom';

import { getDataAndConfig } from '../testHelper';
import SimpleTextGraph from '.';
import Adapter from 'enzyme-adapter-react-16';

const cheerio = require('cheerio')

configure({ adapter: new Adapter() });

describe("SimpleTextGraph", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('SimpleTextGraph');
    });

    describe("SimpleTextGraph", () => {
        let graph, simpleTextGraph, $;
        beforeAll(async () => {
            graph = mount(
                <SimpleTextGraph
                    width={500}
                    height={500}
                    configuration={config.configurations}
                    data={config.data}>
                </SimpleTextGraph>
            );
            simpleTextGraph = graph.html();
            $ = cheerio.load(simpleTextGraph);
        });

        it("Value", () => {
            const value = $('div').last().text();
            expect(value).toBe('100');
        });
    });

    describe("Click Event", () => {
        const mockCallBack = jest.fn();
        const element = document.createElement("div");
        beforeAll((done) => {
            document.body.appendChild(element);
            ReactDOM.render(
                <SimpleTextGraph
                    width={500}
                    height={500}
                    configuration={config.configurations}
                    data={config.data}
                    onMarkClick={mockCallBack}
                />,
                element
            )
            setTimeout(() => {
                done();
            }, 1000);
        });

        afterAll(() => {
            document.body.removeChild(element);
        });

        it("Click On Text", () => {
            element.querySelector('div').click();
            expect(mockCallBack).toHaveBeenCalled();
        });
    });
});
