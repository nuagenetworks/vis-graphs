import React from 'react';
import { mount, configure } from 'enzyme';
import ReactDOM from 'react-dom';
import { getHtml, getDataAndConfig, totalRows, checkRowData, totalColumn, checkTime } from '../testHelper';
import Table from '.';
import Adapter from 'enzyme-adapter-react-16';

const cheerio = require('cheerio');

configure({ adapter: new Adapter() });

describe('TableGraph', () => {
    let config;
    beforeAll(async () => {
        config = await getDataAndConfig('Table');
        global.document.body.createTextRange = () => {
            return {
                setEnd: () => { },
                setStart: () => { },
                getBoundingClientRect: () => { },
                getClientRects: () => []
            }
        }
    });

    describe('hidePagination', () => {
        let hidePagination, $, page;
        beforeAll(async () => {
            hidePagination = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.hidePagination}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(hidePagination, 'table');
            page = cheerio.load(hidePagination.html());
        });

        it('Total Column', () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(5);
        })

        it("Column Names", () => {
            var columnList = hidePagination.props().configuration.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    if($(this).text() != "")
                        return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const date = checkTime(15008863469);
            const firstRow = [
                date,
                "Testing",
                "200.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const date = checkTime(25008863469);
            const secondRow = [
                date,
                "Developing",
                "300.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(100);
        });

        it("Pagination Text", () => {
            const text = page('table').parent().parent().next().find('div').first().text();
            expect(text).toEqual("");
        });

        it("Pagination Previous", () => {
            const prev = page('table').parent().parent().next().find('button').attr('disabled');
            expect(prev).toEqual(undefined);
        })

        it("Pagination Next", () => {
            const next = page('table').parent().parent().next().find('button').next().attr('disabled');
            expect(next).toEqual(undefined);
        })
    });

    describe("Hide SearchBar", () => {
        let hideSearchBar, $;
        beforeAll(async () => {
            hideSearchBar = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.hideSearchBar}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(hideSearchBar, 'table');
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(5);
        });

        it("Column Names", () => {
            var columnList = hideSearchBar.props().configuration.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    if($(this).text() != "")
                        return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const date = checkTime(15008863469);
            const firstRow = [
                date,
                "Testing",
                "200.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const date = checkTime(25008863469);
            const secondRow = [
                date,
                "Developing",
                "300.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(100);
        });

        it("SearchBar Text", () => {
            const search = $('.search-label').text();
            expect(search).toEqual('');
        });

        it("SearchBar", () => {
            const searchBarAndButton = $('.filter').children().length;
            expect(searchBarAndButton).toEqual(0);
        });
    });

    describe("selectAll", () => {
        let selectAll, $;
        beforeAll(async () => {
            selectAll = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.selectAll}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(selectAll, 'table');
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(5);
        });

        it("Column Names", () => {
            var columnList = selectAll.props().configuration.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    if($(this).text() != "") {
                        return $(this).text();
                    }
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const date = checkTime(15008863469);
            const firstRow = [
                date,
                "Testing",
                "200.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const date = checkTime(25008863469);
            const secondRow = [
                date,
                "Developing",
                "300.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(100);
        });
    });

    describe("highlightColumn", () => {
        let highlightColumn, $;
        beforeAll(async () => {
            highlightColumn = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.highlightColumn}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(highlightColumn, 'table');
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(5);
        });

        it("Column Names", () => {
            var columnList = highlightColumn.props().configuration.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    if($(this).text() != "")
                        return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const date = checkTime(15008863469);
            const firstRow = [
                date,
                "Testing",
                "200.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const date = checkTime(25008863469);
            const secondRow = [
                date,
                "Developing",
                "300.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(100);
        });
    });

    describe("search Single Value", () => {
        let search, $;
        beforeAll(async (done) => {
            search = await mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.search}
                    data={config.data}>
                </Table>
            );
            setTimeout(() => {
                search.update();
                done();
            }, 2000);
            $ = cheerio.load(search.html());;
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(5);
        });

        it("Column Names", () => {
            var columnList = config.search.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    if($(this).text() != "")
                        return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const date = checkTime(15008863000);
            const firstRow = [
                date,
                "Testing",
                "200.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const date = checkTime(25008863469);
            const secondRow = [
                date,
                "Developing",
                "300.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(100);
        });

        it("SearchBar Text", () => {
            const search = $('.search-label').text();
            expect(search).toEqual('Search:  ');
        });

        it("SearchBar", () => {
            const searchBarAndButton = $('.filter').children().length;
            expect(searchBarAndButton).toEqual(2);
        });

    });

    describe("search With AND Operator", () => {
        let searchWithAndOperator, $;
        beforeAll(async (done) => {
            searchWithAndOperator = await mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.searchWithAndOperator}
                    data={config.data}>
                </Table>
            );
            setTimeout(() => {
                searchWithAndOperator.update();
                done();
            }, 2000);
            $ = cheerio.load(searchWithAndOperator.html());;
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(5);
        });

        it("Column Names", () => {
            var columnList = config.searchWithAndOperator.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                if(key !== 0)
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    if($(this).text() != "")
                        return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const date = checkTime(15008863000);
            const firstRow = [
                date,
                "Testing",
                "200.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const date = checkTime(25008863469);
            const secondRow = [
                date,
                "Developing",
                "300.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(100);
        });

        it("SearchBar Text", () => {
            const search = $('.search-label').text();
            expect(search).toEqual('Search:  ');
        });

        it("SearchBar", () => {
            const searchBarAndButton = $('.filter').children().length;
            expect(searchBarAndButton).toEqual(2);
        });

    });

    describe("search With OR Operator", () => {
        let searchWithOrOperator, $;
        beforeAll(async (done) => {
            searchWithOrOperator = await mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.searchWithOrOperator}
                    data={config.data}>
                </Table>
            );
            setTimeout(() => {
                searchWithOrOperator.update();
                done();
            }, 2000);
            $ = cheerio.load(searchWithOrOperator.html());;
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(5);
        });

        it("Column Names", () => {
            var columnList = config.searchWithOrOperator.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    if($(this).text() != "")
                        return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const date = checkTime(15008863469);
            const firstRow = [
                date,
                "Testing",
                "200.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const date = checkTime(25008863469);
            const secondRow = [
                date,
                "Developing",
                "300.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(100);
        });

        it("SearchBar Text", () => {
            const search = $('.search-label').text();
            expect(search).toEqual('Search:  ');
        });

        it("SearchBar", () => {
            const searchBarAndButton = $('.filter').children().length;
            expect(searchBarAndButton).toEqual(2);
        });

    });

    describe("search With NOT Operator", () => {
        let searchWithNotOperator, $;
        beforeAll(async (done) => {
            searchWithNotOperator = await mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.searchWithNotOperator}
                    data={config.data}>
                </Table>
            );
            setTimeout(() => {
                searchWithNotOperator.update();
                done();
            }, 2000);
            $ = cheerio.load(searchWithNotOperator.html());;
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(5);
        });

        it("Column Names", () => {
            var columnList = config.searchWithNotOperator.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    if($(this).text() != "")
                        return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const date = checkTime(15008863469);
            const firstRow = [
                date,
                "Testing",
                "200.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const date = checkTime(25008863000);
            const secondRow = [
                date,
                "Developing",
                "300.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(100);
        });

        it("SearchBar Text", () => {
            const search = $('.search-label').text();
            expect(search).toEqual('Search:  ');
        });

        it("SearchBar", () => {
            const searchBarAndButton = $('.filter').children().length;
            expect(searchBarAndButton).toEqual(2);
        });

    });

    describe("toolTip", () => {
        let toolTip, $;
        beforeAll(async () => {
            toolTip = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.toolTip}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(toolTip, 'table');
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(5);
        });

        it("Column Names", () => {
            var columnList = toolTip.props().configuration.data.columns;
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    const text = $(this).text();
                    if(text != "") {
                        return text;
                    }
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const date = checkTime(15008863469);
            const firstRow = [
                date,
                "Testin...",
                "200.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const date = checkTime(25008863469);
            const secondRow = [
                date,
                "Develo...",
                "300.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(100);
        });
    });

    describe("pagination", () => {
        let pagination, $, page, paginationTable;
        beforeAll(async () => {
            pagination = mount(
                <Table
                    width={500}
                    height={500}
                    configuration={config.pagination}
                    data={config.data}>
                </Table>
            );
            $ = getHtml(pagination, 'table');
            page = cheerio.load(pagination.html());
            paginationTable = page('table').last();
        });

        it("Total Column", () => {
            const noOfColumns = totalColumn($);
            expect(noOfColumns).toBe(5);
        });

        it("Column Names", () => {
            var columnList = config.pagination.data.columns
            var columns = Object.keys(columnList).map(function (key) {
                return columnList[key].column;
            });
            const tableColumns = $('table thead th').map(
                function (i) {
                    if($(this).text() != "")
                        return $(this).text();
                }
            ).get();
            expect(tableColumns).toEqual(columns);
        });

        it("First Row Data", () => {
            const value = checkRowData($);
            const date = checkTime(15008863469);
            const firstRow = [
                date,
                "Testing",
                "200.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(firstRow);
        });

        it("Second Row Data", () => {
            const value = checkRowData($, "second");
            const date = checkTime(25008863469);
            const secondRow = [
                date,
                "Developing",
                "300.54545454545456",
                "2422791762"
            ];
            expect(value).toEqual(secondRow);
        });

        it("Total Rows", () => {
            const noOfRows = totalRows($);
            expect(noOfRows).toBe(100);
        });

        it("Pagination Text", () => {
            const text = paginationTable.find('td').find('div').find('p').next().next().text();
            expect(text).toEqual("1-100 of 144");
        });

        it("Pagination Previous", () => {
            const prev = paginationTable.find('td').find('div').find('button').attr('disabled');
            expect(prev).toEqual("disabled");
        })

        it("Pagination Next", () => {
            const next = paginationTable.find('td').find('div').find('button').next().attr('disabled');
            expect(next).toEqual(undefined);
        })
    });

    describe("Click Event", () => {
        let table;
        const handleRowSelection = jest.fn();
        const element = document.createElement("div");
        beforeAll((done) => {
            document.body.appendChild(element);
            table = ReactDOM.render(
                <Table
                    width={500}
                    height={500}
                    configuration={config.pagination}
                    data={config.data}
                    handleRowSelection={handleRowSelection}
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

        it("Click On Table", (done) => {
            element.querySelector('td').click();
            setTimeout(() => {
                done();
                expect(handleRowSelection).toHaveBeenCalled();
            }, 1000);
        });
    });

    describe("Show Info Box", () => {
      let pagination, $, page, paginationTable;
      beforeAll(async () => {
          pagination = mount(
              <Table
                  width={500}
                  height={500}
                  configuration={config.showInfoBox}
                  data={config.data}>
              </Table>
          );
          $ = getHtml(pagination, 'table');
          page = cheerio.load(pagination.html());
          paginationTable = page('table').last();
      });

      it("Total Column", () => {
          const noOfColumns = totalColumn($);
          expect(noOfColumns).toBe(5);
      });

      it("Column Names", () => {
          var columnList = config.pagination.data.columns
          var columns = Object.keys(columnList).map(function (key) {
              return columnList[key].column;
          });
          const tableColumns = $('table thead th').map(
              function (i) {
                  if($(this).text() != "")
                      return $(this).text();
              }
          ).get();
          expect(tableColumns).toEqual(columns);
      });

      it("First Row Data", () => {
          const value = checkRowData($);
          const date = checkTime(15008863469);
          const firstRow = [
              date,
              "Testing",
              "200.54545454545456",
              "2422791762"
          ];
          expect(value).toEqual(firstRow);
      });

      it("Second Row Data", () => {
          const value = checkRowData($, "second");
          const date = checkTime(25008863469);
          const secondRow = [
              date,
              "Developing",
              "300.54545454545456",
              "2422791762"
          ];
          expect(value).toEqual(secondRow);
      });

      it("Total Rows", () => {
          const noOfRows = totalRows($);
          expect(noOfRows).toBe(100);
      });

      it('Show Info Box Button', () => {
        const isButtonExist = $('.showInfoBox');
        expect(isButtonExist).toBeTruthy();
      })
    });

    describe("Context Event", () => {
      let table;
      const handleContextMenu = jest.fn();
      const element = document.createElement("div");
      beforeAll((done) => {
          document.body.appendChild(element);
          table = ReactDOM.render(
              <Table
                  width={500}
                  height={500}
                  configuration={config.contextMenu}
                  data={config.data}
                  handleContextMenu={handleContextMenu}
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

      it("Click On Table", (done) => {
          element.querySelector('td').dispatchEvent(new MouseEvent('contextmenu', {bubbles: true}));
          setTimeout(() => {
              done();
              expect(handleContextMenu).toHaveBeenCalled();
          }, 1000);
      });
  });
})
