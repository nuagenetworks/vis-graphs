import React from 'react';
import ReactDom from 'react-dom';

import { getDataAndConfig, mockUseEffect, clearAllMocks, createElement, appendChildToElement, removeElement, mockGetBBox } from '../testHelper';
import AreaGraph from '.';
import { BRUSH_HEIGHT } from '../../constants';

const cheerio = require('cheerio');

describe("AreaGraph", () => {
  let config;

  beforeAll(async () => {
    config = await getDataAndConfig('AreaGraph');
    mockGetBBox()
  });

  describe("Simple", () => {
    let $;
    const element = createElement();

    beforeAll((done) => {

      mockUseEffect();
      appendChildToElement(element);
      ReactDom.render(
        <AreaGraph
          width={500}
          height={500}
          configuration={config.simple}
          data={config.data}>
        </AreaGraph>,
        element
      );
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
    });

    afterAll(() => {
      removeElement(element);
      clearAllMocks();
    });

    it("SVG Dimensions", () => {
      const height = $('svg').attr('height');
      const width = $('svg').attr('width');
      expect(height).toEqual("500");
      expect(width).toEqual("500");
    });

    it("Total AreaGraph", () => {
      const noOfAreaBlock = $('.area-fill').find('.recharts-area-area').length;
      const noOfLineBlock = $('.area-fill').find('.recharts-area-curve').length;
      expect(noOfAreaBlock).toBe(1);
      expect(noOfLineBlock).toBe(1)
    });

    it("AreaGraph Dimensions", () => {
      const areaGraph = $('.area-fill').find('.recharts-area-area').attr("d");
      expect(areaGraph).toEqual("M90,420C108.09523809523809,420,126.19047619047619,420,144.28571428571428,420C162.38095238095238,420,180.47619047619045,420,198.57142857142856,420C216.66666666666666,420,234.76190476190476,420,252.85714285714286,420C270.95238095238096,420,289.04761904761904,420,307.1428571428571,420C325.23809523809524,420,343.3333333333333,420,361.42857142857144,420C379.5238095238095,420,397.61904761904765,420,415.7142857142857,420C433.8095238095238,420,451.9047619047619,420,470,420L470,420C451.9047619047619,420,433.8095238095238,420,415.7142857142857,420C397.61904761904765,420,379.5238095238095,420,361.42857142857144,420C343.3333333333333,420,325.23809523809524,420,307.1428571428571,420C289.04761904761904,420,270.95238095238096,420,252.85714285714286,420C234.76190476190476,420,216.66666666666666,420,198.57142857142856,420C180.47619047619045,420,162.38095238095238,420,144.28571428571428,420C126.19047619047619,420,108.09523809523809,420,90,420Z");
    });

    it("AreaGraph Legends", () => {
      const noOfLegends = $('.recharts-legend-wrapper').find('div').find('div').length;
      expect(noOfLegends).toBe(1);
    });

    it("xAxis Ticks Length", () => {
      const xAxisTicks = $('.recharts-xAxis').find('.graph-axis').length;
      expect(xAxisTicks).toBe(8);
    });

    it("yAxis Ticks Length", () => {
      const yAxisTicks = $('.recharts-yAxis').find('.graph-axis').length;
      expect(yAxisTicks).toBe(5);
    });
  });

  describe("Simple with brush", () => {
    let $;
    const element = createElement();

    beforeAll((done) => {

      mockUseEffect();
      appendChildToElement(element);
      ReactDom.render(
        <AreaGraph
          width={500}
          height={500}
          configuration={config.simplewithbrush}
          data={config.data}>
        </AreaGraph>,
        element
      );
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
    });

    afterAll(() => {
      removeElement(element);
      clearAllMocks();
    });

    it("SVG Dimensions", () => {
      const height = $('svg').attr('height');
      const width = $('svg').attr('width');
      expect(height).toEqual("500");
      expect(width).toEqual("500");
    });

    it("Total AreaGraph", () => {
      const noOfAreaBlock = $('.area-fill').find('.recharts-area-area').length;
      const noOfLineBlock = $('.area-fill').find('.recharts-area-curve').length;
      expect(noOfAreaBlock).toBe(1);
      expect(noOfLineBlock).toBe(1)
    });

    it("AreaGraph Dimensions", () => {
      const areaGraph = $('.area-fill').find('.recharts-area-area').attr("d");
      expect(areaGraph).toEqual("M90,400C108.09523809523809,400,126.19047619047619,400,144.28571428571428,400C162.38095238095238,400,180.47619047619045,400,198.57142857142856,400C216.66666666666666,400,234.76190476190476,400,252.85714285714286,400C270.95238095238096,400,289.04761904761904,400,307.1428571428571,400C325.23809523809524,400,343.3333333333333,400,361.42857142857144,400C379.5238095238095,400,397.61904761904765,400,415.7142857142857,400C433.8095238095238,400,451.9047619047619,400,470,400L470,400C451.9047619047619,400,433.8095238095238,400,415.7142857142857,400C397.61904761904765,400,379.5238095238095,400,361.42857142857144,400C343.3333333333333,400,325.23809523809524,400,307.1428571428571,400C289.04761904761904,400,270.95238095238096,400,252.85714285714286,400C234.76190476190476,400,216.66666666666666,400,198.57142857142856,400C180.47619047619045,400,162.38095238095238,400,144.28571428571428,400C126.19047619047619,400,108.09523809523809,400,90,400Z");
    });

    it("AreaGraph Legends", () => {
      const noOfLegends = $('.recharts-legend-wrapper').find('div').find('div').length;
      expect(noOfLegends).toBe(1);
    });

    it("xAxis Ticks Length", () => {
      const xAxisTicks = $('.recharts-xAxis').find('.graph-axis').length;
      expect(xAxisTicks).toBe(8);
    });

    it("yAxis Ticks Length", () => {
      const yAxisTicks = $('.recharts-yAxis').find('.graph-axis').length;
      expect(yAxisTicks).toBe(5);
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
      expect(tickPos).toBe(90);
    });

    it('Default brush tick end', () => {
      const tickPos = parseInt($('.recharts-brush').find('g').next().find('rect').attr('x'));
      expect(tickPos).toBe(465);
    });

  });

  describe("Stacked", () => {
    let $;
    const element = createElement();

    beforeAll((done) => {

      mockUseEffect();
      appendChildToElement(element);
      ReactDom.render(
        <AreaGraph
          width={500}
          height={500}
          configuration={config.stacked}
          data={config.data}>
        </AreaGraph>,
        element
      );
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
    });

    afterAll(() => {
      removeElement(element);
      clearAllMocks();
    });

    it("SVG Dimensions", () => {
      const height = $('svg').attr('height');
      const width = $('svg').attr('width');
      expect(height).toEqual("500");
      expect(width).toEqual("500");
    });

    it("Total AreaGraph", () => {
      const noOfAreaBlock = $('.area-fill').find('.recharts-area-area').length;
      const noOfLineBlock = $('.area-fill').find('.recharts-area-curve').length;
      expect(noOfAreaBlock).toBe(1);
      expect(noOfLineBlock).toBe(1)
    });

    it("AreaGraph Dimensions", () => {
      const areaGraph = $('.area-fill').find('.recharts-area-area').attr("d");
      expect(areaGraph).toEqual("M90,445C108.09523809523809,445,126.19047619047619,445,144.28571428571428,445C162.38095238095238,445,180.47619047619045,445,198.57142857142856,445C216.66666666666666,445,234.76190476190476,445,252.85714285714286,445C270.95238095238096,445,289.04761904761904,445,307.1428571428571,445C325.23809523809524,445,343.3333333333333,445,361.42857142857144,445C379.5238095238095,445,397.61904761904765,445,415.7142857142857,445C433.8095238095238,445,451.9047619047619,445,470,445L470,445C451.9047619047619,445,433.8095238095238,445,415.7142857142857,445C397.61904761904765,445,379.5238095238095,445,361.42857142857144,445C343.3333333333333,445,325.23809523809524,445,307.1428571428571,445C289.04761904761904,445,270.95238095238096,445,252.85714285714286,445C234.76190476190476,445,216.66666666666666,445,198.57142857142856,445C180.47619047619045,445,162.38095238095238,445,144.28571428571428,445C126.19047619047619,445,108.09523809523809,445,90,445Z");
    });

    it("AreaGraph Legends", () => {
      const noOfLegends = $('.recharts-legend-wrapper').find('div').find('div').length;
      expect(noOfLegends).toBe(1);
    });

    it("xAxis Ticks Length", () => {
      const xAxisTicks = $('.recharts-xAxis').find('.graph-axis').length;
      expect(xAxisTicks).toBe(8);
    });

    it("yAxis Ticks Length", () => {
      const yAxisTicks = $('.recharts-yAxis').find('.graph-axis').length;
      expect(yAxisTicks).toBe(5);
    });
  });

  describe("Null Data", () => {
    let $;
    const element = createElement();

    beforeAll((done) => {

      mockUseEffect();
      appendChildToElement(element);
      ReactDom.render(
        <AreaGraph
          width={500}
          height={500}
          configuration={config.stacked}
          data={config.nullData}>
        </AreaGraph>,
        element
      );
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
    });

    afterAll(() => {
      removeElement(element);
      clearAllMocks();
    });

    it("SVG Dimensions", () => {
      const height = $('svg').attr('height');
      const width = $('svg').attr('width');
      expect(height).toEqual("500");
      expect(width).toEqual("500");
    });

    it("Total AreaGraph", () => {
      const noOfAreaBlock = $('.area-fill').find('.recharts-area-area').length;
      const noOfLineBlock = $('.area-fill').find('.recharts-area-curve').length;
      expect(noOfAreaBlock).toBe(1);
      expect(noOfLineBlock).toBe(1)
    });

    it("AreaGraph Dimensions", () => {
      const areaGraph = $('.area-fill').find('.recharts-area-area').attr("d");
      expect(areaGraph).toEqual("M90,445C108.09523809523809,445,126.19047619047619,445,144.28571428571428,445C162.38095238095238,445,180.47619047619045,445,198.57142857142856,445C216.66666666666666,445,234.76190476190476,445,252.85714285714286,445C270.95238095238096,445,289.04761904761904,445,307.1428571428571,445C325.23809523809524,445,343.3333333333333,445,361.42857142857144,445C379.5238095238095,445,397.61904761904765,445,415.7142857142857,445C433.8095238095238,445,451.9047619047619,445,470,445L470,445C451.9047619047619,445,433.8095238095238,445,415.7142857142857,445C397.61904761904765,445,379.5238095238095,445,361.42857142857144,445C343.3333333333333,445,325.23809523809524,445,307.1428571428571,445C289.04761904761904,445,270.95238095238096,445,252.85714285714286,445C234.76190476190476,445,216.66666666666666,445,198.57142857142856,445C180.47619047619045,445,162.38095238095238,445,144.28571428571428,445C126.19047619047619,445,108.09523809523809,445,90,445Z");
    });

    it("AreaGraph Legends", () => {
      const noOfLegends = $('.recharts-legend-wrapper').find('div').find('div').length;
      expect(noOfLegends).toBe(1);
    });

    it("xAxis Ticks Length", () => {
      const xAxisTicks = $('.recharts-xAxis').find('.graph-axis').length;
      expect(xAxisTicks).toBe(8);
    });

    it("yAxis Ticks Length", () => {
      const yAxisTicks = $('.recharts-yAxis').find('.graph-axis').length;
      expect(yAxisTicks).toBe(5);
    });
  });
});
