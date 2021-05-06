import React, { Children } from 'react';
import { mount, configure } from 'enzyme';
import ReactDOM from 'react-dom';

import { getDataAndConfig, getHtml, totalRows, checkRowData, totalColumn, checkTime, clearAllMocks } from '../testHelper';
import Table from '.';
import Adapter from 'enzyme-adapter-react-16';

const cheerio = require('cheerio');

configure({ adapter: new Adapter() });

describe('Table Graph', () => {
    let config;
    beforeAll(async () => {
        jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(500);
        config = await getDataAndConfig('Table');
    });

    describe('Table', () => {

        describe("Hide SearchBar", () => {
            let hideSearchBar, $;
            beforeAll((done) => {
                hideSearchBar = mount(
                    <Table
                        width={500}
                        height={500}
                        configuration={config.hideSearchBar}
                        data={config.data}>
                    </Table>
                );
                setTimeout(() => {
                    done();
                    $ = getHtml(hideSearchBar, 'table');
                }, 300);
                
            });

            it("Total Column", () => {
                const noOfColumns = totalColumn($);
                expect(noOfColumns).toBe("4");
            });

            it("Column Names", () => {
                var columnList = config.hideSearchBar.data.columns;
                var columns = Object.keys(columnList).map(function (key) {
                    return columnList[key].column;
                });
                const tableColumns = $('.ReactVirtualized__Table__headerRow').children().map(
                    function (i) {
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
                expect(noOfRows).toBe("144");
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
            beforeAll((done) => {
                selectAll = mount(
                    <Table
                        width={500}
                        height={500}
                        configuration={config.selectAll}
                        data={config.data}>
                    </Table>
                );
                setTimeout(() => {
                    done();
                    $ = getHtml(selectAll, 'table');
                }, 300);
            });

            it("Total Column", () => {
                const noOfColumns = totalColumn($);
                expect(noOfColumns).toBe("4");
            });

            it("Column Names", () => {
                var columnList = config.selectAll.data.columns;
                var columns = Object.keys(columnList).map(function (key) {
                    return columnList[key].column;
                });
                const tableColumns = $('.ReactVirtualized__Table__headerRow').children().map(
                    function (i) {
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
                expect(noOfRows).toBe("144");
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
                expect(noOfColumns).toBe("4");
            });

            it("Column Names", () => {
                var columnList = config.highlightColumn.data.columns;
                var columns = Object.keys(columnList).map(function (key) {
                    return columnList[key].column;
                });
                const tableColumns = $('.ReactVirtualized__Table__headerRow').children().map(
                    function (i) {
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
                expect(noOfRows).toBe("144");
            });
        });

        describe("selectColumn", () => {
            let selectColumn, $;
            beforeAll(async () => {
                selectColumn = mount(
                    <Table
                        width={500}
                        height={500}
                        configuration={config.selectColumn}
                        data={config.data}>
                    </Table>
                );
                $ = getHtml(selectColumn, 'table');
            });

            it("Total Column", () => {
                const noOfColumns = totalColumn($);
                expect(noOfColumns).toBe("4");
            });

            it("Column Names", () => {
                var columnList = config.selectColumn.data.columns;
                var columns = Object.keys(columnList).map(function (key) {
                    return columnList[key].column;
                });
                const tableColumns = $('.ReactVirtualized__Table__headerRow').children().map(
                    function (i) {
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
                expect(noOfRows).toBe("144");
            });

            it("Select Column DropDown", () => {
                const cheerioNew = cheerio.load($('.select-column').html());
                const dropDownText = cheerioNew('.select-column').text();
                expect(dropDownText).toEqual("Select Columns");
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
                expect(noOfColumns).toBe("4");
            });

            it("Column Names", () => {
                var columnList = config.toolTip.data.columns;
                var columns = Object.keys(columnList).map(function (key) {
                    return columnList[key].column;
                });
                const tableColumns = $('.ReactVirtualized__Table__headerRow').children().map(
                    function (i) {
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
                expect(noOfRows).toBe("144");
            });
        });

        describe("Click Event", () => {
            const mockCallBack = jest.fn();
            const handleRowSelection = jest.fn();
            const element = document.createElement("div");
            beforeAll(() => {
                ReactDOM.render(
                    <Table
                        width={500}
                        height={500}
                        configuration={config.pagination}
                        data={config.data}
                        onRowSelection={handleRowSelection}
                        onMarkClick={mockCallBack}
                    />,
                    element
                )
            });

            it("Click On Table", () => {
                element.querySelector('.ReactVirtualized__Table__row').click();
                setTimeout(() => {
                    done();
                    expect(handleRowSelection).toHaveBeenCalled();
                    expect(mockCallBack).toHaveBeenCalled();
                }, 1000);
            });
        });
    });

    afterAll(() => {
        clearAllMocks();
    });
});
