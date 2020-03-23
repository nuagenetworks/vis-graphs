import React from 'react';
const cheerio = require('cheerio');
import ReactDom from 'react-dom';

import { getDataAndConfig } from '../testHelper';
import AreaGraph from '.';
import { BRUSH_HEIGHT } from '../../constants';

describe("AreaGraph", () => {
  let config;
  let useEffect;

  const mockUseEffect = () => {
    useEffect.mockImplementationOnce(f => f());
  };

  beforeAll(async () => {
    config = await getDataAndConfig('AreaGraph');
  });

  describe("Simple", () => {
    let simple, $;
    const element = document.createElement("div");

    beforeAll((done) => {
      useEffect = jest.spyOn(React, "useEffect");

      mockUseEffect();
      document.body.appendChild(element);

      simple = ReactDom.render(
        <AreaGraph
          width={500}
          height={500}
          configuration={config.simple}
          data={config.data}>
        </AreaGraph>,
        element
      );
      mockUseEffect();
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
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
      expect(areaGraph).toEqual("M90,49.98036999999999C108.09523809523809,49.98009249999999,126.19047619047619,49.979814999999995,144.28571428571428,49.97953749999999C162.38095238095238,49.97925999999999,180.47619047619045,49.978982499999994,198.57142857142856,49.97870499999999C216.66666666666666,49.97842749999999,234.76190476190476,49.97814999999999,252.85714285714286,49.97787249999999C270.95238095238096,49.97759499999999,289.04761904761904,49.97731749999999,307.1428571428571,49.97703999999999C325.23809523809524,49.976762499999985,343.3333333333333,49.97648499999999,361.42857142857144,49.97620749999999C379.5238095238095,49.975929999999984,397.61904761904765,49.97565249999999,415.7142857142857,49.975374999999985C433.8095238095238,49.97509749999998,451.9047619047619,49.97481999999999,470,49.974542499999984L470,400C451.9047619047619,400,433.8095238095238,400,415.7142857142857,400C397.61904761904765,400,379.5238095238095,400,361.42857142857144,400C343.3333333333333,400,325.23809523809524,400,307.1428571428571,400C289.04761904761904,400,270.95238095238096,400,252.85714285714286,400C234.76190476190476,400,216.66666666666666,400,198.57142857142856,400C180.47619047619045,400,162.38095238095238,400,144.28571428571428,400C126.19047619047619,400,108.09523809523809,400,90,400Z");
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
    let simpleWithBrush, $;
    const element = document.createElement("div");

    beforeAll((done) => {
      useEffect = jest.spyOn(React, "useEffect");

      mockUseEffect();
      document.body.appendChild(element);

      simpleWithBrush = ReactDom.render(
        <AreaGraph
          width={500}
          height={500}
          configuration={config.simplewithbrush}
          data={config.data}>
        </AreaGraph>,
        element
      );
      mockUseEffect();
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
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
      expect(areaGraph).toEqual("M90,49.98036999999999C108.09523809523809,49.98009249999999,126.19047619047619,49.979814999999995,144.28571428571428,49.97953749999999C162.38095238095238,49.97925999999999,180.47619047619045,49.978982499999994,198.57142857142856,49.97870499999999C216.66666666666666,49.97842749999999,234.76190476190476,49.97814999999999,252.85714285714286,49.97787249999999C270.95238095238096,49.97759499999999,289.04761904761904,49.97731749999999,307.1428571428571,49.97703999999999C325.23809523809524,49.976762499999985,343.3333333333333,49.97648499999999,361.42857142857144,49.97620749999999C379.5238095238095,49.975929999999984,397.61904761904765,49.97565249999999,415.7142857142857,49.975374999999985C433.8095238095238,49.97509749999998,451.9047619047619,49.97481999999999,470,49.974542499999984L470,400C451.9047619047619,400,433.8095238095238,400,415.7142857142857,400C397.61904761904765,400,379.5238095238095,400,361.42857142857144,400C343.3333333333333,400,325.23809523809524,400,307.1428571428571,400C289.04761904761904,400,270.95238095238096,400,252.85714285714286,400C234.76190476190476,400,216.66666666666666,400,198.57142857142856,400C180.47619047619045,400,162.38095238095238,400,144.28571428571428,400C126.19047619047619,400,108.09523809523809,400,90,400Z");
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
    let stacked, $;
    const element = document.createElement("div");

    beforeAll((done) => {
      useEffect = jest.spyOn(React, "useEffect");

      mockUseEffect();
      document.body.appendChild(element);

      stacked = ReactDom.render(
        <AreaGraph
          width={500}
          height={500}
          configuration={config.stacked}
          data={config.data}>
        </AreaGraph>,
        element
      );
      mockUseEffect();
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
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
      expect(areaGraph).toEqual("M90,49.98036999999999C108.09523809523809,49.98009249999999,126.19047619047619,49.979814999999995,144.28571428571428,49.97953749999999C162.38095238095238,49.97925999999999,180.47619047619045,49.978982499999994,198.57142857142856,49.97870499999999C216.66666666666666,49.97842749999999,234.76190476190476,49.97814999999999,252.85714285714286,49.97787249999999C270.95238095238096,49.97759499999999,289.04761904761904,49.97731749999999,307.1428571428571,49.97703999999999C325.23809523809524,49.976762499999985,343.3333333333333,49.97648499999999,361.42857142857144,49.97620749999999C379.5238095238095,49.975929999999984,397.61904761904765,49.97565249999999,415.7142857142857,49.975374999999985C433.8095238095238,49.97509749999998,451.9047619047619,49.97481999999999,470,49.974542499999984L470,400C451.9047619047619,400,433.8095238095238,400,415.7142857142857,400C397.61904761904765,400,379.5238095238095,400,361.42857142857144,400C343.3333333333333,400,325.23809523809524,400,307.1428571428571,400C289.04761904761904,400,270.95238095238096,400,252.85714285714286,400C234.76190476190476,400,216.66666666666666,400,198.57142857142856,400C180.47619047619045,400,162.38095238095238,400,144.28571428571428,400C126.19047619047619,400,108.09523809523809,400,90,400Z");
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
    let stacked, $;
    const element = document.createElement("div");

    beforeAll((done) => {
      useEffect = jest.spyOn(React, "useEffect");

      mockUseEffect();
      document.body.appendChild(element);

      stacked = ReactDom.render(
        <AreaGraph
          width={500}
          height={500}
          configuration={config.stacked}
          data={config.nullData}>
        </AreaGraph>,
        element
      );
      mockUseEffect();
      setTimeout(() => {
        done();
        $ = cheerio.load(element.innerHTML);
      }, 3000);
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
      expect(areaGraph).toEqual("M90,49.98036999999999C108.09523809523809,49.98009249999999,126.19047619047619,49.979814999999995,144.28571428571428,49.97953749999999C162.38095238095238,49.97925999999999,180.47619047619045,49.978982499999994,198.57142857142856,49.97870499999999C216.66666666666666,49.97842749999999,234.76190476190476,49.97814999999999,252.85714285714286,49.97787249999999C270.95238095238096,49.97759499999999,289.04761904761904,49.97731749999999,307.1428571428571,49.97703999999999C325.23809523809524,49.976762499999985,343.3333333333333,49.97648499999999,361.42857142857144,49.97620749999999C379.5238095238095,49.975929999999984,397.61904761904765,49.97565249999999,415.7142857142857,49.975374999999985C433.8095238095238,49.97509749999998,451.9047619047619,49.97481999999999,470,49.974542499999984L470,400C451.9047619047619,400,433.8095238095238,400,415.7142857142857,400C397.61904761904765,400,379.5238095238095,400,361.42857142857144,400C343.3333333333333,400,325.23809523809524,400,307.1428571428571,400C289.04761904761904,400,270.95238095238096,400,252.85714285714286,400C234.76190476190476,400,216.66666666666666,400,198.57142857142856,400C180.47619047619045,400,162.38095238095238,400,144.28571428571428,400C126.19047619047619,400,108.09523809523809,400,90,400Z");
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
