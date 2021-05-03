import React from 'react';
import { mount, configure } from 'enzyme';
import ReactDOM from 'react-dom';

import { getDataAndConfig } from '../testHelper';
import TextGraph from '.';
import Adapter from 'enzyme-adapter-react-16';

const cheerio = require('cheerio')

configure({ adapter: new Adapter() });

describe("TextGraph", () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('TextGraph');
    });

    describe("TextGraph", () => {
        let graph, textGraph, $;
        beforeAll(async () => {
            graph = mount(
                <TextGraph
                    width={500}
                    height={500}
                    configuration={config.configurations}
                    data={config.data}>
                </TextGraph>
            );
            textGraph = graph.html();
            $ = cheerio.load(textGraph);
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
                <TextGraph
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
