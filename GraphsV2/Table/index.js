import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react'
import { compose } from 'redux';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Tooltip } from 'react-lightweight-tooltip';
import { first, last, isEqual, orderBy, isEmpty, uniq, debounce } from 'lodash';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import objectPath from "object-path";
import hash from 'object-hash';
import IconButton from 'material-ui/IconButton';
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh';
import { FaRegEye as EyeIcon, FaRegClipboard } from 'react-icons/fa';

import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import columnAccessor from "../../utils/columnAccessor";
import { toolTipStyle, lastColToolTipStyle, firstColToolTipStyle } from './tooltipStyle';
import "./style.css";
import style from './style';
import { properties } from "./default.config";
import { expandExpression, labelToField } from '../../utils/helpers';
import { events } from '../../utils/types';
import SearchBar from "../../SearchBar";
import InfoBox from "../../InfoBox";
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

let displayColumn = [];
let filterData = [];
let container = "";
let selectedRows = {};
const TIMEOUT = 1000;

const useStyles  = (props) => ({
  MUIDataTableSelectCell: {
      root: {
          display: props.showCheckboxes ? '' : 'none',
      },
  },
  MUIDataTableBody: {
      emptyTitle: {
          maxWidth: props.width,
      },
  },
  MUIDataTable: {
      responsiveScroll: {
          height: (props.height - props.heightMargin),
      },
  },
  MUIDataTableToolbar: {
      actions: {
          marginTop: props.searchBar || props.searchBar === undefined ? '-90px' : '0px',
          marginRight: props.searchBar || props.searchBar === undefined ? '-10px' : '0px',
      }
  },
  MuiPaper: {
      elevation4: {
          boxShadow: (props.searchBar || props.searchBar === undefined ? '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)' : '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 0px 0px 0px rgba(0,0,0,0.12)'),
      }
  },
  MUIDataTableToolbarSelect: {
      root: {
          display: "none",
      },
  },
  MuiTableCell: {
      root: {
          padding: "10px 20px 10px 15px",
          fontSize: props.fontSize,
      },
      head: {
          backgroundColor: "#FAFAFA !important",
      }
  },
  MUIDataTableHeadCell: {
      root: {
          whiteSpace: 'nowrap',
      }
  },
  MUIDataTableBodyCell: {
      root: {
        whiteSpace: 'nowrap',
      }
  }
});

const getRemovedColumns = (columns, filterColumns, selectedColumns) => {
    let removedColumns = [];
    columns.forEach((d, index) => {
        if (d.displayOption) {
            if (d.display === false || !filterColumns.length || !filterColumns.find(column => d.column === column)) {
                removedColumns.push(`${index}`);
            }
        } else if (selectedColumns && selectedColumns.length) {
            if (!selectedColumns.find(column => d.label === column)) {
                removedColumns.push(`${index}`)
            }
        } else if (d.display === false) {
            removedColumns.push(`${index}`);
        }
    });
    return removedColumns;
}

const getColumnByContext = (columns, context) => {
    const filterColumns = [];
    let removedColumnsKey = '';
    columns.forEach((d) => {
        if (d.displayOption) {
            for (let key in d.displayOption) {
                if (context.hasOwnProperty(key)) {
                    removedColumnsKey = context[key];
                    const keyValue = d.displayOption[key];
                    const contextKeyValue = context[key];
                    if ((typeof keyValue === 'string' && contextKeyValue === keyValue) ||
                        (Array.isArray(keyValue) && keyValue.includes(contextKeyValue))) {
                        filterColumns.push(d.column);
                    }
                }
            }
        }
    })
    return { filterColumns, removedColumnsKey };
}

const updateTableStatus = (param = {}, updateScroll) => (updateScroll && updateScroll(param));

const resetFilters = (selectedRow = {}) => {
    selectedRows = selectedRow;
}

const getGraphProperties = (props) => {
    const {
        data,
        scrollData,
        size,
    } = props;

    return {
        searchString: objectPath.has(scrollData, 'searchText') ? objectPath.get(scrollData, 'searchText') : null,
        sort: objectPath.has(scrollData, 'sort') ? objectPath.get(scrollData, 'sort') : undefined,
        size: size || data.length,
        pageSize: objectPath.has(scrollData, 'pageSize') ? objectPath.get(scrollData, 'pageSize') : properties.limit || 100,
        currentPage: objectPath.has(scrollData, 'currentPage') ? objectPath.get(scrollData, 'currentPage') : 1,
        expiration: objectPath.has(scrollData, 'expiration') ? objectPath.get(scrollData, 'expiration') : false,
    }
}

const getHeaderData = (props, initialSort, stateSortOrder, removedColumns) => {
    const { ESColumns } = props;
    let columnKeys = new Map();

    if (ESColumns) {
        ESColumns.forEach(item => {
            columnKeys.set(item.key, true);
        });
    }

    const columns = props.properties.columns || [];
    let headerData = [];
    for (let index in columns) {
        if (columns.hasOwnProperty(index)) {
            const columnRow = columns[index];
            const displayColumn = removedColumns.includes(index) ? 'false' : 'true';
            const sort = !isEmpty(columnKeys) ? columnKeys.get(columnRow.column) : true;
            const headerColumn = {
                name: index,
                label: columnRow.label || columnRow.column,
                columnField: columnRow.column,
                columnText: columnRow.selection ? "" : (columnRow.label || columnRow.column),
                filter: columnRow.filter !== false,
                type: columnRow.selection ? "selection" : "text",
                style: {
                    textIndent: '2px'
                },
                options: {
                    display: displayColumn,
                    sort,
                }
            };

            if ((initialSort && initialSort.column === columnRow.column) ||
                (stateSortOrder && stateSortOrder.column === columnRow.column)) {
                headerColumn.options = {
                    display: displayColumn,
                    sortDirection: isEmpty(initialSort) ? stateSortOrder.order : initialSort.order,
                    sort,
                }
            }
            headerData.push(headerColumn);
        }
    }

    return headerData;
}

const getHeightMargin = (properties) => {
    const {
        searchBar,
        selectColumnOption,
        filterOptions,
        showFooter,
    } = properties;

    let heightMargin = showFooter ? 40 : 0;
    heightMargin = searchBar === false ? heightMargin : heightMargin + 50;
    heightMargin = filterOptions ? heightMargin : heightMargin + 10;
    heightMargin = selectColumnOption ? heightMargin + 20 : heightMargin;

    return heightMargin;
}

const removeHighlighter = (data = [], highlight, selected) => {
    if (!data.length)
        return data;

    if (highlight) {
        selected.forEach((key) => {
            if (highlight && data[key]) {
                for (let i in data[key]) {
                    if (data[key].hasOwnProperty(i)) {
                        if (data[key][i].props.style)
                            data[key][i].props.style.background = '';
                    }
                }
            }
        })
    }
    return data;
}

const setSelectedRows = (props) => {
    const {
        scrollData,
        requestId,
    } = props;

    const selectedRows = objectPath.has(scrollData, 'selectedRow') ? objectPath.get(scrollData, 'selectedRow') : {};
    return selectedRows[requestId];
}

const getColumns = (props) => (props.properties.columns || []);

const isScrollExpired = (props) => {
    const {
        expiration,
    } = getGraphProperties(props);

    return props.scroll && expiration && expiration <= Date.now();
}

const isScrollDataExists = (page, props) => {
    const {
        data,
    } = props;

    const {
        pageSize,
    } = getGraphProperties(props);

    let startIndex = (page - 1) * pageSize;
    return startIndex < data.length;
}

const getSelectedRows = (props) => {
    const {
        pageSize,
    } = getGraphProperties(props);

    let selected = [];
    for (let page in selectedRows) {
        if (selectedRows.hasOwnProperty(page)) {
            selectedRows[page].forEach((index) => {
                selected.push(props.data[(page - 1) * pageSize + index]);
            })
        }
    }
    return selected;
}

const Table = (props) => {
    const {
        width,
        height,
        properties,
        scroll,
        scrollData,
        context, 
        selectedColumns,
    } = props;

    const {
        showCheckboxes,
        hidePagination,
        fixedHeader,
        selectColumnOption,
        searchBar,
    } = properties;

    let multiSelectable = true;

    const [selected, setSelectedState] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [data, setData] = useState([]);
    const [fontSize, setFontSize] = useState(style.defaultFontsize);
    const [contextMenu, setContextMenu] = useState(null);
    const [showInfoBox, setShowInfoBox] = useState(false);
    const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
    const [infoBoxRow, setInfoBoxRow] = useState({});
    const [infoBoxColumn, setInfoBoxColumn] = useState({});
    const [infoBoxData, setInfoBoxData] = useState({});
    const [infoBoxScript, setInfoBoxScript] = useState({});
    const [originalData, setOriginalData] = useState([]);
    const [stateData, setStateData] = useState([]);
    const [stateSortOrder, setStateSortOrder] = useState({});
    const [initialSort, setInitialSort] = useState({});
    const [headerData, setHeaderData] = useState({});
    const [displayColumns, setDisplayColumns] = useState([]);
    const [removedColumns, setRemovedColumn] = useState([]);
    const [dataMap, setDataMap] = useState(new Map());
    const [unformattedData, setUnformattedData] = useState({});

    const { filterColumns } = getColumnByContext(props.properties.columns || [], context);
    const removedColumn = getRemovedColumns(props.properties.columns || [], filterColumns, selectedColumns);
    const columns = objectPath.has(scrollData, `removedColumn`) ? objectPath.get(scrollData, `removedColumn`) : uniq(removedColumn);
    
    if(!isEqual(removedColumns, columns)) {
        setRemovedColumn(columns);
    }

    const {
        size,
        pageSize,
        currentPage,
    } = getGraphProperties(props);

    const decrementFontSize = () => (setFontSize(fontSize - 1));

    const checkFontsize = () => (container && container.querySelector('table').clientWidth > container.clientWidth && fontSize >= style.defaultFontsize ? decrementFontSize() : fontSize);
    
    const handleSearch = (data, isSuccess, expression = null, searchText = null) => {
        if (isSuccess) {
            if (expression) {
                const {
                    searchString,
                } = getGraphProperties(props);

                const search = labelToField(expandExpression(expression), getColumns(props));
                filterData = data;
                setStateData(filterData);
                resetFilters();
                updateData(true);

                if (!searchText || searchString !== searchText) {
                    updateTableStatus({ search, searchText, selectedRow: {}, currentPage: 1, event: events.SEARCH }, props.updateScroll);
                }
            } else {
                filterData = data;
                setStateData(filterData);
                resetFilters();
                updateData(true);
            }
        }
    }

    const initiate = (props) => {
        const {
            scroll,
            scrollData,
        } = props;
    
        const {
            pageSize
        } = getGraphProperties(props);
    
        if (scroll) {
            selectedRows = setSelectedRows(props);
            if (!objectPath.has(scrollData, 'pageSize')) {
                updateTableStatus({ pageSize }, props.updateScroll);
            }
        }
    
        const {
            matchingRowColumn,
        } = properties;
    
        const columns = getColumns(props);
    
        if (!columns.length) {
            return;
        }
    
        filterData = [];
        const columnNameList = [];
    
        columns.forEach(d => {
            columnNameList.push(d.column);
        });
    
        props.data.forEach((d, i) => {
            const random = Math.floor(new Date().valueOf() * Math.random());
            const data = {
                'row_id': random,
            };
    
            for (let key in columns) {
                if (columns.hasOwnProperty(key)) {
                    const columnData = { ...columns[key] };
                    delete columnData.totalCharacters;
    
                    const accessor = columnAccessor(columnData);
                    data[columnData.column] = accessor(d);
    
                    if (columnData.tooltip && !columnNameList.includes(columnData.tooltip.column)) {
                        data[columnData.tooltip.column] = columnAccessor({ column: columnData.tooltip.column })(d);
                    }
    
                    if (matchingRowColumn && !columnNameList.includes(matchingRowColumn)) {
                        data[matchingRowColumn] = columnAccessor({ column: matchingRowColumn })(d);
                    }
                }
            }
    
            filterData.push(data);
            setUnformattedData({[random] : d});
        });
        setStateData(filterData);
        setOriginalData(filterData);
        resetFilters(selectedRows);
    }

    const getInitialSort = (props, sortOrder) => {
        const {
            sort,
        } = getGraphProperties(props);
    
        if (sort && sort.column && sort.order && !isEqual(initialSort, sort)) {
            setInitialSort({ ...sort, column: sort.column });
        } else if (!isEmpty(sortOrder)) {
            setInitialSort(sortOrder);
        }
    
        return initialSort;
    }

    const updateData = (isSearch = false) => {
        const {
            data,
            selected,
            tableData,
        } = getData(isSearch);

        setSelectedState(selected);
        setTableData(tableData);
        setData(data);
    }

    const getTableData = (columns, tableData) => {
        const {
            highlight,
            highlightColor,
        } = properties;

        if (!columns) {
            return [];
        }

        const keyColumns = getColumns(props);
        const usedColumns = keyColumns.filter((column, index) => !removedColumns.includes(index.toString()));

        if (usedColumns.length) {
            first(usedColumns).firstColStyle = firstColToolTipStyle;
            last(usedColumns).lastColStyle = lastColToolTipStyle;
        }

        const parsedData = tableData.map((d, j) => {

            const dataKey = hash(d);

            if (dataMap.has(dataKey)) {
                return dataMap.get(dataKey);
            }

            let data = {},
                highlighter = false;

            for (let key in keyColumns) {
                if (keyColumns.hasOwnProperty(key)) {

                    const columnObj = keyColumns[key],
                        originalData = d[columnObj.column];
                    let columnData = originalData;

                    if (columnObj.totalCharacters) {
                        columnData = columnAccessor({ column: columnObj.column, totalCharacters: columnObj.totalCharacters })(d);
                    }

                    if ((columnData || columnData === 0) && columnObj.tooltip) {
                        let fullText = d[columnObj.tooltip.column] || originalData;
                        fullText = Array.isArray(fullText) ? fullText.join(", ") : fullText;

                        const hoverContent = (
                            <div key={`tooltip_${j}_${key}`}>
                                {fullText} &nbsp;
                                <CopyToClipboard text={fullText ? fullText.toString() : ''}>
                                    <button style={{ background: '#000', padding: 1 }} title="copy">
                                        <FaRegClipboard size={10} color="#fff" />
                                    </button>
                                </CopyToClipboard>
                            </div>
                        )

                        columnData = (
                            <Tooltip key={`tooltip_${j}_${key}`}
                                content={[hoverContent]}
                                styles={columnObj.firstColStyle || columnObj.lastColStyle || toolTipStyle}>
                                {columnData}
                            </Tooltip>
                        )
                    }

                    if (highlight && highlight.includes(columnObj.column) && originalData) {
                        highlighter = true;
                    }

                    if (columnObj.colors && columnObj.colors[originalData]) {
                        columnData = (
                            <div style={{ background: columnObj.colors[originalData] || '', width: "10px", height: "10px", borderRadius: "50%", marginRight: "6px" }}></div>
                        )
                    }

                    if (columnObj.infoBox && columnData) {
                        columnData = (
                            <React.Fragment>
                                {columnData}
                                <span style={{ padding: "0px 5px" }} className="showInfoBox" onClick={(e) => {
                                    e.stopPropagation();
                                    openInfoBox({
                                        infoBoxRow: d,
                                        infoBoxColumn: columnObj.column,
                                        infoBoxData: originalData,
                                        infoBoxScript: columnObj.infoBox
                                    })
                                }}>
                                    <EyeIcon size={fontSize + 2} color="#555555" />
                                </span>
                            </React.Fragment>
                        )
                    }

                    if (columnData || columnData === 0) {
                        data[key] = typeof(columnData) === "boolean" ? columnData.toString().toUpperCase() :
                            (typeof originalData === "object") ? React.isValidElement(originalData) ? columnData : null : columnData;

                        if (columnObj.fontColor) {
                            data[key] = <div style={{ color: columnObj.fontColor }}> {data[key]} </div>;
                        }
                    }
                }
            }

            if (highlighter) {
                Object.keys(data).map(key => {
                    return data[key] = <div style={{ background: highlightColor || '', height: style.row.height, padding: "10px 0" }}>
                        {data[key]}</div>
                })
            }
            setDataMap(dataMap.set(dataKey, data));
            return data
        })

        return parsedData;
    }

    const handleColumnViewChange = (changedColumn, action) => {
        let latestDisplayColumns = [];

        if (action === 'remove') {
            latestDisplayColumns = displayColumns.length === 0 ?
                uniq([...displayColumns, ...removedColumns, changedColumn]) :
                uniq([...displayColumns, changedColumn]);
        } else {
            const mergedColumns = displayColumns.length === 0 ?
                uniq([...displayColumns, ...removedColumns]) : displayColumns;

            const mergedIndex = mergedColumns.indexOf(changedColumn);
            if (mergedIndex > -1 && !isEmpty(mergedColumns)) {
                mergedColumns.splice(mergedIndex, 1);
            }
            latestDisplayColumns = [...mergedColumns];
        }
        if(!isEqual(displayColumns,latestDisplayColumns)) {
            setDisplayColumns(latestDisplayColumns);
            displayColumn = latestDisplayColumns;
            const newHeaderData = getHeaderData(props, getInitialSort(props), null, latestDisplayColumns);
            if(!isEqual(headerData, newHeaderData)) {
                setHeaderData(newHeaderData);
            }
        }
    }

    const handleScrollSorting = (column) => {
        const { sort } = getGraphProperties(props);

        let colOrder = 'asc';
        if (sort && sort.column === column) {
            colOrder = sort.order === 'desc' ? 'asc' : 'desc';
        }

        updateTableStatus({
            sort: { column: column, order: colOrder },
            currentPage: 1,
            selectedRow: {},
            event: events.SORTING,
        }, props.updateScroll)
    }

    const getData = (isSearch) => {
        
        const {
            highlight
        } = props.properties;

        filterData = !isSearch && !isEmpty(stateData) ? stateData : filterData;
        
        const {
            pageSize,
            currentPage
        } = getGraphProperties(props);

        const offset = pageSize * (currentPage - 1);
        const data = scroll ? filterData.slice(0, offset + pageSize) : filterData;
        let tableData = getTableData(getColumns(props), data);

        if (highlight) {
            tableData = removeHighlighter(tableData, highlight, selected);
        }

        return {
            data,
            selected: selectedRows[currentPage] || [],
            tableData,
        }
    }

    const handleStaticSorting = (column) => {
        let colOrder = 'asc';
        const sortOrder = !isEmpty(stateSortOrder) ? stateSortOrder : {};
        if (sortOrder && sortOrder.column === column) {
            colOrder = sortOrder.order === 'desc' ? 'asc' : 'desc';
            sortOrder.order = colOrder;
            setStateSortOrder(sortOrder);
        } else {
            sortOrder.order = colOrder;
            sortOrder.column = column;
            setStateSortOrder(sortOrder);
        }

        filterData = !isEmpty(stateData) ? stateData : filterData;
        filterData = orderBy(filterData, [column], [colOrder]);
        setStateData(filterData);

        resetFilters();
        const newHeaderData = getHeaderData(props, getInitialSort(props, sortOrder), sortOrder, !isEmpty(displayColumns) ? displayColumns : removedColumns);
        if(!isEqual(headerData, newHeaderData)) {
            setHeaderData(newHeaderData);
        }
        updateData();
    }

    const handleSortOrderChange = (column, order) => {
        const columnList = getColumns(props);
        const columnData = columnList[column];

        scroll ? handleScrollSorting(columnData.column) : handleStaticSorting(columnData.column)
    }

    const handlePageClick = (page) => {
        const {
            currentPage
        } = getGraphProperties(props);

        let pageNo;

        if (page > currentPage - 1) {
            if (isScrollExpired(props) && !isScrollDataExists(currentPage + 1, props)) {
                setShowConfirmationPopup(true);
                return;
            }
            pageNo = currentPage + 1;
        } else {
            pageNo = currentPage - 1;
        }

        scroll ? updateTableStatus({ currentPage: pageNo, event: events.PAGING }, props.updateScroll) : updateData();
        
        const newHeaderData = getHeaderData(props, getInitialSort(props), null, !isEmpty(displayColumns) ? displayColumns : removedColumns);
        if(!isEqual(headerData, newHeaderData)) {
            setHeaderData(newHeaderData);
        }
    }

    const handleClick = (key) => {
        if (props.onMarkClick && data[key])
            props.onMarkClick(unformattedData[data[key]['row_id']]);
    }

    const handleRowSelection = (currentSelectedRow, allRows) => {
        const {
            currentPage
        } = getGraphProperties(props);

        let selectedRowsCurr = [];
        allRows.forEach(x => {
            if (!selectedRowsCurr.includes(x.dataIndex)) {
                selectedRowsCurr.push(x.dataIndex);
            }
        });

        const {
            multiSelectable,
            matchingRowColumn,
        } = properties;

        if (!multiSelectable) {
            handleClick(...selectedRowsCurr);
            selectedRows = {};
        }

        selectedRows[currentPage] = selectedRowsCurr.slice();
        const { onSelect, scrollData } = properties;
        if (onSelect) {
            let matchingRows = [];
            let rows = {};
            const selectedData = getSelectedRows(props);
            if (selectedData.length > 1) {
                rows = selectedData;
            } else {
                let row = selectedData.length ? selectedData[0] : {};
                if (matchingRowColumn && row) {
                    const value = objectPath.get(row, matchingRowColumn);
                    matchingRows = props.data.filter((d) => {
                        const matchingRowValue = objectPath.get(d, matchingRowColumn);
                        return (value || value === 0) && !isEqual(row, d) && value === matchingRowValue;
                    });
                }
                rows = row;
            }
            onSelect({ rows, matchingRows });
        }

        const rowsInStore = objectPath.has(scrollData, 'selectedRow') ? objectPath.get(scrollData, 'selectedRow') : {}
        saveSelectedRow({ selectedRow: { ...rowsInStore, [props.requestId]: selectedRows } }, props.updateScroll);
    }

    const saveSelectedRow = debounce((tableData, updateScroll) => {
        clearTimeout();
        updateTableStatus(tableData, updateScroll);
    }, TIMEOUT);

    const getMenu = () => {
        const {
            menu,
            multiMenu,
        } = properties;

        if (multiMenu && getSelectedRows(props).length > 1) {
            return multiMenu;
        }

        return menu || false;
    }

    const handleContextMenu = (event) => {
        const menu = getMenu();

        if (!menu) {
            return false;
        }
        event.preventDefault();
        const { clientX: x, clientY: y } = event;
        setContextMenu({ x, y });
        return true;
    }

    const handleCloseContextMenu = () => {
        setContextMenu({ contextMenu: null });
        closeContextMenu();
    }

    const closeContextMenu = () => {
        document.body.removeEventListener('click', handleCloseContextMenu);
        const node = document.getElementById('contextMenu');
        if (node) {
            node.remove();
        }
    }

    const openContextMenu = () => {
        const { x, y } = contextMenu;
        const menu = getMenu();

        closeContextMenu();
        document.body.addEventListener('click', handleCloseContextMenu);

        const node = document.createElement('ul');
        node.classList.add('contextMenu');
        node.id = 'contextMenu';
        node.style = `top: ${y}px; left: ${x}px; z-index: 100000;`;

        const { goTo, context, id } = props;
        context.id = id;

        menu.forEach((item) => {
            const { text, rootpath, params } = item;
            const pathname = `${process.env.PUBLIC_URL}/${rootpath}`;
            const li = document.createElement('li');
            li.textContent = text;
            const queryParams = (params && Object.getOwnPropertyNames(params).length > 0) ?
                Object.assign({}, context, params) : Object.assign({}, context);
            li.onclick = (e) => {
                goTo && goTo(pathname, queryParams);
            };
            node.append(li);
        });
        document.body.append(node);
    }

    const renderSearchBarIfNeeded = (headerData) => {

        if(isEmpty(headerData)) {
            return;
        }

        const {
            searchString,
        } = getGraphProperties(props);
        const {
            searchBar,
            searchText,
            autoSearch,
            disableRefresh,
            selectColumnOption,
        } = properties;

        const {
            width,
        } = props;

        if (searchBar === false)
            return;

        const search = searchString !== null ? searchString : searchText,
            filteroption = headerData.filter(d => d.options.display === 'true');
        return ((filteroption.length || (originalData.length === 0)) &&
            <SearchBar
                data={originalData}
                searchText={search}
                options={filteroption}
                handleSearch={handleSearch}
                scroll={props.scroll}
                autoSearch={autoSearch}
                enableRefresh={!disableRefresh && scroll}
                columnOption={selectColumnOption}
                cardWidth={width}
            />
        );
    }

    const resetScrollData = () => {
        const { disableRefresh } = properties;

        return (
            scroll && !disableRefresh ?
                <div style={{ flex: "none" }}>
                    <IconButton
                        tooltip="Refresh"
                        tooltipPosition={'top-left'}
                        style={style.button.design}
                        onClick={() => updateTableStatus({ currentPage: 1, selectedRow: {}, event: events.REFRESH }, props.updateScroll)}
                    >
                        <RefreshIcon className='refreshIcon' />
                    </IconButton>
                </div>
                : ''
        )
    }

    const openInfoBox = ({
        infoBoxRow,
        infoBoxColumn,
        infoBoxData,
        infoBoxScript,
    }) => {
        setShowInfoBox(true);
        setInfoBoxRow(infoBoxRow);
        setInfoBoxColumn(infoBoxColumn);
        setInfoBoxData(infoBoxData);
        setInfoBoxScript(infoBoxScript);
    }

    const onInfoBoxCloseHandler = () => setShowInfoBox(false);

    const renderInfoBox = () => {
        const {
            Script,
        } = props;

        return (
            showInfoBox &&
            <InfoBox
                onInfoBoxClose={onInfoBoxCloseHandler}
            >
                <Script
                    row={infoBoxRow}
                    key={infoBoxColumn}
                    value={infoBoxData}
                    script={infoBoxScript}
                />
            </InfoBox>
        )
    }

    const renderConfirmationDialog = () => {
        const actions = [
            <FlatButton
                label="Stay on Current Page"
                labelStyle={style.button.labelStyle}
                primary={true}
                onClick={() => setShowConfirmationPopup(false)}
            />,
            <FlatButton
                label="Continue"
                labelStyle={style.button.labelStyle}
                primary={true}
                onClick={() => updateTableStatus({ currentPage: 1, selectedRow: {}, event: events.REFRESH }, props.updateScroll)}
            />,
        ];

        return (
            showConfirmationPopup &&
            <React.Fragment>
                <Dialog
                    title="Unable to fetch"
                    actions={actions}
                    modal={true}
                    contentClassName='dialogBody'
                    open={true}
                >
                    Due to inactivity, we are not able to process the next page. Please press "Continue", to reload the data from first page.
                </Dialog>
            </React.Fragment>
        );
    }

    const cleanup = () => {
        const {
            scrollData,
        } = props;

        if (!isEmpty(displayColumn)) {
            updateTableStatus({
                [`removedColumn`]: displayColumn,
                event: events.REMOVED_COLUMNS
            }, props.updateScroll);
        }

        const rowsInStore = objectPath.has(scrollData, 'selectedRow') ? objectPath.get(scrollData, 'selectedRow') : {}

        if (!objectPath.has(scrollData, 'selectedRow') && !isEmpty(selectedRows)) {
            updateTableStatus({ selectedRow: { ...rowsInStore, [props.requestId]: selectedRows } }, props.updateScroll)
        }

        selectedRows = {};
        filterData = [];
    }
 
    useEffect(() => {
        initiate(props);
        updateData();
        checkFontsize();
        if(contextMenu) {
            openContextMenu();
        }
    }, [props.data, props.scrollData]);

    useEffect(() => {
        return () => {
            cleanup();
        }
    }, []);

    const tableCurrentPage = currentPage - 1;
    const newHeaderData = getHeaderData(props, getInitialSort(props), null, !isEmpty(displayColumns) ? displayColumns : removedColumns);
    if(!isEqual(headerData, newHeaderData)) {
        setHeaderData(newHeaderData);
    }
    const totalRecords = scroll ? size : filterData.length;
    const showFooter = (totalRecords <= pageSize && hidePagination !== false && scroll !== true) ? false : true;
    const heightMargin = getHeightMargin({ ...properties, showFooter });
    const options = {
        print: false,
        filter: false,
        download: false,
        search: false,
        sort: true,
        viewColumns: selectColumnOption || false,
        responsive: "scroll",
        fixedHeaderOptions: { yAxis: fixedHeader },
        pagination: showFooter,
        rowsPerPage: pageSize,
        count: totalRecords,
        page: tableCurrentPage,
        rowsPerPageOptions: [],
        selectableRows: multiSelectable ? 'multiple' : 'single',
        onChangePage: handlePageClick,
        rowsSelected: selected,
        onRowsSelect: props.handleRowSelection ? props.handleRowSelection : handleRowSelection,
        selectableRowsOnClick: true,
        onColumnSortChange: handleSortOrderChange,
        onColumnViewChange: handleColumnViewChange,
        disableToolbarSelect: true,
        textLabels: {
            body: {
                noMatch: "No data to visualize",
                toolTip: "Sort",
            },
            pagination: {
                next: "Next Page",
                previous: "Previous Page",
                rowsPerPage: "Rows per page:",
                displayRows: "of",
            },
            toolbar: {
                viewColumns: "Select Column",
            },
            viewColumns: {
                title: "Select Column",
                titleAria: "Show/Hide Table Columns",
            },
            selectedRows: {
                text: "row(s) selected",
                delete: "Delete",
                deleteAria: "Delete Selected Rows",
            },
        },
    };

    const theme = createMuiTheme({
        overrides: { ...style.muiStyling, ...useStyles({showCheckboxes, width, height, heightMargin, searchBar, fontSize}) }
    });

    return (
        <MuiThemeProvider theme={theme}>
            <div ref={(input) => { container = input; }}
                onContextMenu={props.handleContextMenu ? props.handleContextMenu : handleContextMenu}
            >
                {resetScrollData()}

                {renderConfirmationDialog()}
                {renderInfoBox()}

                <div style={{ clear: "both" }}></div>
                {renderSearchBarIfNeeded(headerData)}

                <MUIDataTable
                    data={tableData}
                    columns={headerData}
                    options={options}
                />
            </div>
        </MuiThemeProvider>
    );
}

Table.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object),
};

export default compose(
    WithValidationHOC(),
    (WithConfigHOC(properties))
)(Table);
