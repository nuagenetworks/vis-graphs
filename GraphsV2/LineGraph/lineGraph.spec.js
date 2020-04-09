import React from 'react';
import ReactDom from 'react-dom';

import { getDataAndConfig, createElement, appendChildToElement, removeElement } from '../testHelper';
import LineGraph from '.';
import { BRUSH_HEIGHT } from '../../constants';

const cheerio = require('cheerio');

describe('LineGraph', () => {
  let config

  beforeAll(async () => {
    config = await getDataAndConfig('LineGraph');
  })

  describe("Multi Lines", () => {
    let $;
    const element = createElement();

    beforeAll((done) => {
      appendChildToElement(element);
      ReactDom.render(
        <LineGraph
          width={500}
          height={500}
          configuration={config.multiline}
          data={config.data}>
        </LineGraph>,
        element
      );
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
    });

    afterAll(() => {
      removeElement(element);
    });

    it("SVG Dimensions", () => {
      const height = $('svg').attr('height');
      const width = $('svg').attr('width');
      expect(height).toEqual("500");
      expect(width).toEqual("500");
    });

    it("Total LineGraphs", () => {
      const noOfLines = $('svg').find('.line-graph-line').length;
      expect(noOfLines).toBe(4);
    });

    it("xAxis Ticks Length", () => {
      const xAxisTicks = $('.recharts-xAxis').find('.graph-axis').length;
      expect(xAxisTicks).toBe(4);
    });

    it("yAxis Ticks Length", () => {
      const yAxisTicks = $('.recharts-yAxis').find('.graph-axis').length;
      expect(yAxisTicks).toBe(5);
    });

    it("Number of Legends", () => {
      const noOfLegends = $('.recharts-legend-wrapper').find('div').find('div').length;
      expect(noOfLegends).toBe(4);
    });

  });

  describe("Simple LineGraph", () => {
    let $;
    const element = createElement();

    beforeAll((done) => {
      appendChildToElement(element);
      ReactDom.render(
        <LineGraph
          width={500}
          height={500}
          configuration={config.simple}
          data={config.data}>
        </LineGraph>,
        element
      );
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
    });

    afterAll(() => {
      removeElement(element);
    });

    it("SVG Dimensions", () => {
      const height = $('svg').attr('height');
      const width = $('svg').attr('width');
      expect(height).toEqual("500");
      expect(width).toEqual("500");
    });

    it("Total LineGraphs", () => {
      const noOfLines = $('svg').find('.line-graph-line').length;
      expect(noOfLines).toBe(4);
    });

    it("xAxis Ticks Length", () => {
      const xAxisTicks = $('.recharts-xAxis').find('.graph-axis').length;
      expect(xAxisTicks).toBe(4);
    });

    it("yAxis Ticks Length", () => {
      const yAxisTicks = $('.recharts-yAxis').find('.graph-axis').length;
      expect(yAxisTicks).toBe(5);
    });

    it("Number of Legends", () => {
      const noOfLegends = $('.recharts-legend-wrapper').find('div').find('div').length;
      expect(noOfLegends).toBe(4);
    });
  });

  describe("Simple LineGraph With Ycolumn ", () => {
    let $;
    const element = createElement();

    beforeAll((done) => {
      appendChildToElement(element);
      ReactDom.render(
        <LineGraph
          width={500}
          height={500}
          configuration={config.simpleYcolumn}
          data={config.data}>
        </LineGraph>,
        element
      );
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
    });

    afterAll(() => {
      removeElement(element);
    });

    it("SVG Dimensions", () => {
      const height = $('svg').attr('height');
      const width = $('svg').attr('width');
      expect(height).toEqual("500");
      expect(width).toEqual("500");
    });

    it("Total LineGraphs", () => {
      const noOfLines = $('svg').find('.line-graph-line').length;
      expect(noOfLines).toBe(4);
    });

    it("xAxis Ticks Length", () => {
      const xAxisTicks = $('.recharts-xAxis').find('.graph-axis').length;
      expect(xAxisTicks).toBe(4);
    });

    it("yAxis Ticks Length", () => {
      const yAxisTicks = $('.recharts-yAxis').find('.graph-axis').length;
      expect(yAxisTicks).toBe(5);
    });

    it("Number of Legends", () => {
      const noOfLegends = $('.recharts-legend-wrapper').find('div').find('div').length;
      expect(noOfLegends).toBe(4);
    });

  });

  describe("Multi Line LineGraph With Ycolumn", () => {
    let $;
    const element = createElement();

    beforeAll((done) => {
      appendChildToElement(element);
      ReactDom.render(
        <LineGraph
          width={500}
          height={500}
          configuration={config.multilineYcolumn}
          data={config.data}>
        </LineGraph>,
        element
      );
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
    });

    afterAll(() => {
      removeElement(element);
    });

    it("SVG Dimensions", () => {
      const height = $('svg').attr('height');
      const width = $('svg').attr('width');
      expect(height).toEqual("500");
      expect(width).toEqual("500");
    });

    it("Total LineGraphs", () => {
      const noOfLines = $('svg').find('.line-graph-line').length;
      expect(noOfLines).toBe(4);
    });

    it("xAxis Ticks Length", () => {
      const xAxisTicks = $('.recharts-xAxis').find('.graph-axis').length;
      expect(xAxisTicks).toBe(4);
    });

    it("yAxis Ticks Length", () => {
      const yAxisTicks = $('.recharts-yAxis').find('.graph-axis').length;
      expect(yAxisTicks).toBe(5);
    });

    it("Number of Legends", () => {
      const noOfLegends = $('.recharts-legend-wrapper').find('div').find('div').length;
      expect(noOfLegends).toBe(4);
    });

  });

  describe("Multi Lines", () => {
    let $;
    const element = createElement();

    beforeAll((done) => {
      appendChildToElement(element);
      ReactDom.render(
        <LineGraph
          width={500}
          height={500}
          configuration={config.multilinewithbrush}
          data={config.data}>
        </LineGraph>,
        element
      );
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
    });

    afterAll(() => {
      removeElement(element);
    });
    
    it("SVG Dimensions", () => {
      const height = $('svg').attr('height');
      const width = $('svg').attr('width');
      expect(height).toEqual("500");
      expect(width).toEqual("500");
    });

    it("Total LineGraphs", () => {
      const noOfLines = $('svg').find('.line-graph-line').length;
      expect(noOfLines).toBe(4);
    });

    it("xAxis Ticks Length", () => {
      const xAxisTicks = $('.recharts-xAxis').find('.graph-axis').length;
      expect(xAxisTicks).toBe(4);
    });

    it("yAxis Ticks Length", () => {
      const yAxisTicks = $('.recharts-yAxis').find('.graph-axis').length;
      expect(yAxisTicks).toBe(5);
    });

    it("Number of Legends", () => {
      const noOfLegends = $('.recharts-legend-wrapper').find('div').find('div').length;
      expect(noOfLegends).toBe(4);
    });

    it("Is Brush Available", () => {
      const isBrush = $('.recharts-brush').length;
      expect(isBrush).toBe(1);
    });
    
    it("Brush height", () => {
      const brushHeight = parseInt($('.recharts-brush').find('rect').attr('height'));
      expect(brushHeight).toBe(BRUSH_HEIGHT);
    })

    it('Default brush tick starting', () => {
      const tickPos = parseInt($('.recharts-brush').find('g').find('rect').attr('x'));
      expect(tickPos).toBe(70);
    });

    it('Default brush tick end', () => {
      const tickPos = parseInt($('.recharts-brush').find('g').next().find('rect').attr('x'));
      expect(tickPos).toBe(485);
    });
  });
});
