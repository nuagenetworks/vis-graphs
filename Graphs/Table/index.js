import PropTypes from 'prop-types';
import React from 'react'
import CopyToClipboard from 'react-copy-to-clipboard'
import {Tooltip} from 'react-lightweight-tooltip'
import { first, last, isEqual, orderBy, isEmpty, uniq, debounce } from 'lodash'
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import objectPath from "object-path";
import IconButton from 'material-ui/IconButton';
import RefreshIcon from 'material-ui/svg-icons/navigation/refresh';
import { FaRegEye as EyeIcon, FaRegClipboard } from 'react-icons/fa';
import uuid from 'lodash/uniqueId';

import AbstractGraph from "../AbstractGraph"
import columnAccessor from "../../utils/columnAccessor"
import { toolTipStyle, lastColToolTipStyle, firstColToolTipStyle } from './tooltipStyle'
import "./style.css"
import style from './style'
import {properties} from "./default.config"
import { pick, expandExpression, labelToField } from '../../utils/helpers';
import { events } from '../../utils/types';
import SearchBar from "../../SearchBar";
import InfoBox from "../../InfoBox";
import MUIDataTable from "mui-datatables";
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';

const PROPS_FILTER_KEY = ['data', 'height', 'width', 'context', 'selectedColumns', 'scrollData'];
const STATE_FILTER_KEY = ['selected', 'data', 'fontSize', 'contextMenu', 'showInfoBox', 'showConfirmationPopup'];
const TIMEOUT = 1000;
class Table extends AbstractGraph {
    state = {};
    constructor(props) {
        super(props, properties)
        this.handleSortOrderChange   = this.handleSortOrderChange.bind(this)
        this.handleSearch            = this.handleSearch.bind(this)
        this.handleRowSelection      = this.handleRowSelection.bind(this)
        this.handleContextMenu       = this.handleContextMenu.bind(this)
        this.onInfoBoxCloseHandler   = this.onInfoBoxCloseHandler.bind(this);

        const { limit } = this.getConfiguredProperties();
        this.pageSize =  limit || 500;
        this.scroll = props.scroll;
        this.keyColumns = {};
        this.filterData = [];
        this.selectedRows = {};
        this.sortOrder = {}
        this.displayColumns = [];
        this.dataMap = new Map();
        this.initiate(props);
        this.state = {
            ...this.getData(),
            fontSize: style.defaultFontsize,            
            contextMenu: null,
            showInfoBox: false,
            showConfirmationPopup: false,
            removedColumns: [],
            removedColumnsKey: 'default',
        }
        this.headerData = this.getHeaderData(this.getInitialSort());
        this.option =  {
            print: false,
            filter: false,
            download: false,
            search: false,
            sort: true,
            viewColumns: false,
            responsive: "scrollMaxHeight",
            selectableRows: 'single',
            onChangePage: this.handlePageClick,
            onRowsSelect: this.handleRowSelection,
            selectableRowsOnClick: true,
            onColumnSortChange: this.handleSortOrderChange,
            onChangeRowsPerPage: this.handleRowsPerPageChange,
            onColumnViewChange: this.handleColumnViewChange,
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
            }
        };
    }

    componentWillUnmount() {
        const {
            scrollData,
            requestId,
        } = this.props;
        
        if (!isEmpty(this.displayColumns)) {
            this.updateTableStatus({
                [`removedColumns_`]: this.displayColumns,
                event: events.REMOVED_COLUMNS
            });
        }
        const rowsInStore = objectPath.has(scrollData, 'selectedRow') ? objectPath.get(scrollData, 'selectedRow') : {}
        if(!objectPath.has(scrollData, 'selectedRow') && !isEmpty(this.selectedRows)) {
            this.updateTableStatus({ selectedRow: {...rowsInStore, [requestId] : this.selectedRows } })
        } 
    }

    componentDidMount() {
        const {
            data
        } = this.props;
        
        if (isEmpty(data)) {
            return;
        }

        this.checkFontsize();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const { context, selectedColumns, configuration } = nextProps;
        const columns = configuration.data.columns || [];

        const { filterColumns, removedColumnsKey } = Table.getColumnByContext(columns, context);
        const removedColumns = Table.getRemovedColumns(columns, filterColumns, selectedColumns);

        if (removedColumnsKey !== prevState.removedColumnsKey || !isEqual(removedColumns, prevState.removedColumns)) {
            return { removedColumns, removedColumnsKey};
        }

        return null;
    }

    shouldComponentUpdate(nextProps, nextState) {
        
        return !isEqual(pick(this.props, ...PROPS_FILTER_KEY), pick(nextProps, ...PROPS_FILTER_KEY))
        || !isEqual(pick(this.state, ...STATE_FILTER_KEY), pick(nextState, ...STATE_FILTER_KEY))
    }

    componentDidUpdate(prevProps) {
        const {
            data
        } = this.props;
        
        if (isEmpty(data)) {
            return;
        }

        if((!isEqual(prevProps.data, this.props.data) || !isEqual(prevProps.scrollData, this.props.scrollData))) {
            this.initiate(this.props);
            this.updateData();
        }
        
        this.checkFontsize();
        const { contextMenu } = this.state;
        if (contextMenu) {
            this.openContextMenu();
        }

    }
    // removed columns on the basis of dynamic and display columns
    static getRemovedColumns(columns, filterColumns, selectedColumns) {
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

    // update column dynamically according to the value passed through the context
    static getColumnByContext(columns, context) {
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

    getGraphProperties(props = this.props) {
        const {
            scrollData,
            data,
            size,
        } = props;

        const {
            removedColumns = [],
        } = this.state;

        // Total, per page, current page must be set and only applicable for Table component only.
        return {
            searchString: objectPath.has(scrollData, 'searchText') ? objectPath.get(scrollData, 'searchText') : null,
            sort: objectPath.has(scrollData, 'sort') ? objectPath.get(scrollData, 'sort') : null,
            size: size || data.length, // response length for normal table otherwise total hits for scroll based table.
            pageSize: objectPath.has(scrollData, 'pageSize') ? objectPath.get(scrollData, 'pageSize') : this.pageSize, // Calculate this from the config or (query in case of scroll)
            currentPage: objectPath.has(scrollData, 'currentPage') ? objectPath.get(scrollData, 'currentPage') : 1, // Pass page as 1 for Normal Table and will be handled internally only.
            expiration: objectPath.has(scrollData, 'expiration') ? objectPath.get(scrollData, 'expiration') : false,
            removedColumns: objectPath.has(scrollData, `removedColumns_`) ? objectPath.get(scrollData, `removedColumns_`) : uniq(removedColumns),
        }
    }

    // update scroll data on pagination, searching and sorting.
    updateTableStatus(param = {}) {
        const {
            updateScroll,
        } = this.props;
        updateScroll && updateScroll(param)
    }

    setSelectedRows = (props) => {
      const {
        scrollData,
        requestId,
    } = props;

      const selectedRows = objectPath.has(scrollData, 'selectedRow') ? objectPath.get(scrollData, 'selectedRow') : {};
      return selectedRows[requestId];
    }

    initiate(props) {
        const {
            scroll,
            scrollData,
        } = props;

        const {
            currentPage,
        } = this.getGraphProperties(props);

        if(scroll) {
            this.selectedRows = this.setSelectedRows(props);
            if (!objectPath.has(scrollData, 'pageSize')) {
                this.updateTableStatus({ pageSize: this.pageSize })
            }
        }

        const {
            matchingRowColumn
        } = this.getConfiguredProperties();

        const columns = this.getColumns();

        if (!columns.length)
            return;

        this.filterData    = []
        this.unformattedData = {}
        const columnNameList = []

        columns.forEach( d => {
            columnNameList.push(d.column);
        });

        props.data.forEach( (d, i) => {
            const random = uuid();
            const data = {
                'row_id': random
            };

            for(let key in columns) {
                if(columns.hasOwnProperty(key)) {
                    const columnData = {...columns[key]};
                    delete columnData.totalCharacters;

                    const accessor = columnAccessor(columnData);
                    data[columnData.column] = accessor(d);

                    // add tooltip column data if it doesn't exist in column array
                    if(columnData.tooltip && !columnNameList.includes(columnData.tooltip.column)) {
                        data[columnData.tooltip.column] = columnAccessor({column: columnData.tooltip.column})(d)
                    }

                    // add matching row data if it doesn't exist in column array
                    if(matchingRowColumn && !columnNameList.includes(matchingRowColumn)) {
                        data[matchingRowColumn] = columnAccessor({column: matchingRowColumn})(d)
                    }
                }
            }

            this.filterData.push(data)
            this.unformattedData[random] = d;
        })

        this.resetFilters(currentPage, this.selectedRows);
    }

    getData() {
        const {
            scrollData
        } = this.props;

        const {
            highlight
        } = this.getConfiguredProperties();

        const pageSize = objectPath.has(scrollData, 'pageSize') ? objectPath.get(scrollData, 'pageSize') : this.pageSize;

        const offset = pageSize * (this.currentPage - 1);
        const data = this.scroll ? this.filterData.slice(0, offset + pageSize) : this.filterData;
        let tableData = this.getTableData(this.getColumns(), data);

        if (highlight) {
            tableData = this.removeHighlighter(tableData, highlight);
        }

        return {
            data,
            selected: this.selectedRows[this.currentPage] || [],
            tableData,
        }
    }

    isScrollExpired() {
        const {
            expiration
        } = this.getGraphProperties();

        return this.scroll && expiration && expiration <= Date.now()
    }

    isScrollDataExists(page) {
        const {
            data
        } = this.props;

        const {
            pageSize,
        } = this.getGraphProperties();

        let startIndex = (page - 1) * pageSize;
        return startIndex < data.length;
    }

    decrementFontSize() {
        this.setState({
            fontSize: this.state.fontSize - 1
        })
    }

    checkFontsize() {
        if(this.container &&
            this.container.querySelector('table').clientWidth > this.container.clientWidth &&
            this.state.fontSize >= style.defaultFontsize
        ) {
            this.decrementFontSize();
        }
    }

    resetFilters(page = 1, selectedRows = {}) {
        this.currentPage = page;
        this.selectedRows = selectedRows;
    }

    handleSearch(data, isSuccess, expression = null, searchText = null) {
        if(isSuccess) {
            if(expression) {
                const {
                    searchString
                } = this.getGraphProperties();

                const search = labelToField(expandExpression(expression), this.getColumns())
                this.filterData = data;

                if(!searchText || searchString !== searchText) {
                    this.updateTableStatus({search, searchText , selectedRow: {}, currentPage: 1, event: events.SEARCH})
                }
            } else {
                this.filterData = data;
                this.updateData();
                this.resetFilters();
            }
        }
    }

    updateData() {
        const {
            data,
            selected,
            tableData,
        } = this.getData();

        this.setState({
            data,
            selected,
            tableData,
        });
    }

    getColumns() {
        const {
            configuration,
        } = this.props;

        return configuration.data.columns || [];
    }

    // filter and formatting columns for table header
    getHeaderData(initialSort) {
        const { ESColumns } = this.props;
        let columnKeys = new Map();

        if(ESColumns) {
            ESColumns.forEach(item => {
                columnKeys.set(item.key, true);
            });
        }

        let {
            removedColumns,
        } = this.getGraphProperties();

        if(removedColumns.length <= 0) {
            const { context, selectedColumns, configuration } = this.props;
            const { filterColumns } = Table.getColumnByContext(configuration.data.columns || [], context);        
            removedColumns = Table.getRemovedColumns(configuration.data.columns || [], filterColumns, selectedColumns);
        }

        const columns = this.getColumns()
        let headerData = [];
        for (let index in columns) {
            if (columns.hasOwnProperty(index)) {
                const columnRow = columns[index];                    
                const displayColumn = removedColumns.includes(index) ? 'false' : 'true';
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
                        sort: !isEmpty(columnKeys) ? columnKeys.get(columnRow.column) : true,
                    }
                };
                if((initialSort && initialSort.column === columnRow.column) ||
                (this.sortOrder && this.sortOrder.column === columnRow.column)){
                    headerColumn.options = {
                        display: displayColumn,
                        sortDirection: isEmpty(initialSort) ? this.sortOrder.order : initialSort.order,
                        sort: !isEmpty(columnKeys) ? columnKeys.get(columnRow.column) : true,
                    }
                }
                headerData.push(headerColumn);
            }
        }
        
        return headerData
    }

    getTableData(columns, tableData) {
        const {
            highlight,
            highlightColor,
        } = this.getConfiguredProperties();

        const {
            removedColumns,
        } = this.getGraphProperties();
        
        if (!columns) {
            return [];
        }
        const keyColumns = this.getColumns();
        const usedColumns = keyColumns.filter((column, index) => !removedColumns.includes(index.toString()));

        if(usedColumns.length){
            first(usedColumns).firstColStyle = firstColToolTipStyle;
            last(usedColumns).lastColStyle = lastColToolTipStyle;
        }

        const parsedData =  tableData.map((d, j) => {

            if(this.dataMap.has(d.row_id)) {
                return this.dataMap.get(d.row_id);
            }

            let data = {},
                highlighter = false;

            for (let key in keyColumns) {
                if(keyColumns.hasOwnProperty(key)) {

                    const columnObj  = keyColumns[key],
                        originalData = d[columnObj.column];
                    let columnData   = originalData;

                    // get substring of data upto defined total characters
                    if(columnObj.totalCharacters) {
                        columnData = columnAccessor({column: columnObj.column, totalCharacters: columnObj.totalCharacters})(d)
                    }

                    // enable tooltip on mouse hover
                    if((columnData || columnData === 0) && columnObj.tooltip) {

                        let fullText = d[columnObj.tooltip.column] || originalData

                        fullText = Array.isArray(fullText) ? fullText.join(", ") : fullText

                        const hoverContent = (
                            <div key={`tooltip_${j}_${key}`}>
                                {fullText} &nbsp;
                                <CopyToClipboard text={fullText ? fullText.toString() : ''}>
                                    <button style={{background: '#000', padding: 1}} title="copy">
                                        <FaRegClipboard size={10} color="#fff" />
                                    </button>
                                </CopyToClipboard>
                            </div>
                        )

                        columnData = (
                            <Tooltip key={`tooltip_${j}_${key}`}
                                content={[hoverContent]}
                                styles={ columnObj.firstColStyle || columnObj.lastColStyle || toolTipStyle}>
                                {columnData}
                            </Tooltip>
                        )
                    }

                    // highlight the entire row if highlight array have a column with non-empty value
                    if(highlight && highlight.includes(columnObj.column) && originalData) {           
                        highlighter = true
                    }

                    /**
                     * indicate column value with colors,
                     *  if column value configured in color array as a key with given color as a value. For e.g. -
                     * color {"insla": "red", "outsla": "green"}
                     */
                    if (columnObj.colors && columnObj.colors[originalData]) {
                        columnData =  (
                            <div style={{ background:  columnObj.colors[originalData] || '', width: "10px", height: "10px", borderRadius: "50%", marginRight: "6px" }}></div>
                        )
                    }

                    if(columnObj.infoBox && columnData) {
                        columnData =  (
                            <React.Fragment>
                                {columnData}
                                <span style={{padding: "0px 5px"}} onClick={(e) => {
                                    e.stopPropagation();
                                    this.openInfoBox({
                                        infoBoxRow: d,
                                        infoBoxColumn: columnObj.column,
                                        infoBoxData: originalData,
                                        infoBoxScript: columnObj.infoBox
                                    })
                                }}>
                                    <EyeIcon size={this.state.fontSize + 2} color="#555555" />
                                </span>
                            </React.Fragment>
                        )
                    }

                    if(columnData || columnData === 0) {
                        data[key] = typeof(columnData) === "boolean" ? columnData.toString().toUpperCase() :
                            (typeof originalData === "object") ? React.isValidElement(originalData) ? columnData : null : columnData;

                        data[key] = <div className="wrapper-data"> {data[key]} </div>;
                        /**
                        * define the font color of the column value
                        */
                        if (columnObj.fontColor) {
                            data[key] = <div style={{ color: columnObj.fontColor }}> {data[key]} </div>;
                        }
                    }
                }
            }

            if(highlighter)
                Object.keys(data).map(key => {
                    return data[key] = <div style={{ background: highlightColor || '', height: style.row.height, padding: "10px 0" }}>
                        {data[key]}</div>
                })

            this.dataMap.set(d.row_id, data);
            return data
        });

        return parsedData;
    }

    handleColumnViewChange = (changedColumn, action) => {
        const {
            removedColumns
        } = this.getGraphProperties();

        if (action === 'remove') {
            this.displayColumns = this.displayColumns.length === 0 ? 
            uniq([...this.displayColumns, ...removedColumns, changedColumn]) :
            uniq([...this.displayColumns, changedColumn]);
        } else {
            const mergedColumns = this.displayColumns.length === 0 ? 
            uniq([...this.displayColumns, ...removedColumns]) : this.displayColumns;

            const mergedIndex = mergedColumns.indexOf(changedColumn);
            if (mergedIndex > -1 && !isEmpty(mergedColumns)) {
                mergedColumns.splice(mergedIndex, 1);
            }

            this.displayColumns = [...mergedColumns];
        }
    }

    handleRowsPerPageChange = (numberOfRows) => {
        if (this.scroll) {
            this.updateTableStatus({
                pageSize: numberOfRows,
                event: events.PAGING
            });
        }

        this.pageSize = numberOfRows;
    }

    // when scroll is enabled then call this function
    handleScrollSorting(column) {
        const { sort } = this.getGraphProperties();

        let colOrder = 'asc';
        if (sort && sort.column === column) {
            colOrder = sort.order === 'desc' ? 'asc' : 'desc';
        }
        this.updateTableStatus({
            sort: { column: column, order: colOrder },
            currentPage: 1,
            selectedRow: {},
            event: events.SORTING
        })
    }

    handleStaticSorting(column) {
        let colOrder = 'asc';
        if (this.sortOrder && this.sortOrder.column === column) {
            colOrder = this.sortOrder.order === 'desc' ? 'asc' : 'desc';
            this.sortOrder.order = colOrder;
        } else {
            this.sortOrder.order = colOrder;
            this.sortOrder.column = column;
        }

        this.filterData = orderBy(this.filterData, [column], [colOrder]);

        /**
         * Resetting the paging due to sorting
         */
        this.resetFilters();
        this.headerData = this.getHeaderData(this.getInitialSort());
        this.updateData();
    }

    handleSortOrderChange(column, order) {
        const columnList = this.getColumns();
        const columnData = columnList[column];

        this.scroll ? this.handleScrollSorting(columnData.column) : this.handleStaticSorting(columnData.column)
    }

    handlePageClick = (page) => {
        if (page > this.currentPage - 1) {

            // show confirmation popup to refresh data if scroll is enable
            if (this.isScrollExpired() && !this.isScrollDataExists(this.currentPage + 1)) {
                this.setState({ showConfirmationPopup: true });
                return;
            }

            ++this.currentPage
        } else {
            --this.currentPage;
        }

        this.scroll ? this.updateTableStatus({ currentPage: this.currentPage, event: events.PAGING }) : this.updateData();
    }

    handleClick(key) {
        if(this.props.onMarkClick && this.state.data[key])
            this.props.onMarkClick(this.unformattedData[this.state.data[key]['row_id']]);

    }

    handleRowSelection(currentSelectedRow, allRows) {
        let selectedRows = [];
        allRows.forEach( x => {
            if (!selectedRows.includes(x.dataIndex)) {
                selectedRows.push(x.dataIndex);
            }
        });
                
        const {
            multiSelectable,
            matchingRowColumn
        } = this.getConfiguredProperties();
        
        if (!multiSelectable) {
            this.handleClick(...selectedRows)
            this.selectedRows = {}
        }

        this.selectedRows[this.currentPage] = selectedRows.slice();
        
        const { onSelect, scrollData } = this.props;
        if (onSelect) {
            let matchingRows = [];
            let rows = {};
            const selectedData = this.getSelectedRows();
            if (selectedData.length > 1) {
                rows = selectedData;
            } else {
                let row = selectedData.length ? selectedData[0] : {}
                /**
                 * Compare `matchingRowColumn` value with all available data and if equal to selected row,
                 * then save all matched records in store under "matchedRows",
                **/
                if (matchingRowColumn && row) {

                    const value = objectPath.get(row, matchingRowColumn)
                    matchingRows = this.props.data.filter((d) => {
                        const matchingRowValue = objectPath.get(d, matchingRowColumn)
                        return (value || value === 0) && !isEqual(row, d) && value === matchingRowValue
                    });
                }
                rows = row
            }
            onSelect({ rows, matchingRows });
        }
        const rowsInStore = objectPath.has(scrollData, 'selectedRow') ? objectPath.get(scrollData, 'selectedRow') : {}

      this.saveSelectedRow({ selectedRow: {...rowsInStore, [this.props.requestId] : this.selectedRows }});
    }

    saveSelectedRow = debounce((tableData) => {
        this.updateTableStatus(tableData);
    }, TIMEOUT);

    getMenu() {
        const {
            menu,
            multiMenu
        } = this.getConfiguredProperties();

        if (multiMenu && this.getSelectedRows().length > 1) {
            return multiMenu
        }

        return menu || false
    }

    handleContextMenu(event) {
        const menu = this.getMenu()

        if (!menu) {
            return false;
        }
        event.preventDefault()
        const { clientX: x, clientY: y } = event;
        this.setState({ contextMenu: { x, y } });
        return true;
    }

    handleCloseContextMenu = () => {
        this.setState({ contextMenu: null });
        this.closeContextMenu();
    }

    closeContextMenu = () => {
        document.body.removeEventListener('click', this.handleCloseContextMenu);
        const node = document.getElementById('contextMenu');
        if (node) node.remove();
    }

    openContextMenu = () => {
        const { contextMenu: { x, y } } = this.state;
        const menu = this.getMenu()

        this.closeContextMenu();
        document.body.addEventListener('click', this.handleCloseContextMenu);

        const node = document.createElement('ul');
        node.classList.add('contextMenu');
        node.id = 'contextMenu';
        node.style = `top: ${y}px; left: ${x}px; z-index: 100000;`;

        const { goTo, context, configuration: { id } } = this.props;
        context.id = id;

        menu.forEach((item) => {
            const { text, rootpath, params } = item;
            const pathname = `${process.env.PUBLIC_URL}/${rootpath}`
            const li = document.createElement('li');
            li.textContent = text;
            const queryParams = (params && Object.getOwnPropertyNames(params).length > 0) ?
                Object.assign({}, context, params) : Object.assign({}, context);
            li.onclick = (e) => {
                // dispatch a push to the menu link
                goTo && goTo(pathname, queryParams);
            };
            node.append(li);
        });
        document.body.append(node);
    }

    getSelectedRows() {
        const {
            pageSize
        } = this.getGraphProperties();

        let selected = [];
        for(let page in this.selectedRows) {
            if(this.selectedRows.hasOwnProperty(page)) {
                this.selectedRows[page].forEach((index) => {
                    selected.push(this.props.data[(page - 1) * pageSize + index])
                })
            }
        }
        return selected;
    }

    renderSearchBarIfNeeded(headerData) {
        const {
            searchString
        } = this.getGraphProperties();

        const {
            searchBar,
            searchText,
            autoSearch,
            disableRefresh,
            selectColumnOption,
        } = this.getConfiguredProperties();

        const {
            width,
        } = this.props;

        if(searchBar === false)
            return;

        const search = searchString !== null ? searchString : searchText,
        filteroption = headerData.filter( d => d.options.display === 'true');

        return ( (filteroption.length || (this.filterData.length === 0)) &&
            <SearchBar
                data={this.filterData}
                searchText={search}
                options={filteroption}
                handleSearch={this.handleSearch}
                scroll={this.props.scroll}
                autoSearch={autoSearch}
                enableRefresh={!disableRefresh && this.scroll}
                columnOption={selectColumnOption}
                cardWidth={width}
            />
        );
    }

    removeHighlighter(data = [], highlight) {
        if(!data.length) {
            return data
        }

        this.state.selected.forEach( (key) => {
            if(highlight && data[key]) {
                for (let i in data[key]) {
                    if (data[key].hasOwnProperty(i)) {
                        if(data[key][i].props.style)
                            data[key][i].props.style.background = ''
                    }
                }
            }
        });

        return data
    }

    // reset scroll data.
    resetScrollData() {
        const { disableRefresh } = this.getConfiguredProperties();
        
        return (
            this.scroll && !disableRefresh ?
                <div style={{flex: "none"}}>
                    <IconButton
                        tooltip="Refresh"
                        tooltipPosition={'top-left'}
                        style={style.button.design}
                        onClick={ () => this.updateTableStatus({currentPage: 1, selectedRow: {}, event: events.REFRESH})}
                    >
                        <RefreshIcon className='refreshIcon' />
                    </IconButton>
                </div>
                : ''
        )
    }

    openInfoBox({
        infoBoxRow,
        infoBoxColumn,
        infoBoxData,
        infoBoxScript
    }) {
        this.setState({
            showInfoBox: true,
            infoBoxRow,
            infoBoxColumn,
            infoBoxData,
            infoBoxScript,
        });
    }

    onInfoBoxCloseHandler() {
        this.setState({
            showInfoBox: false,
        });
    }

    renderInfoBox() {
        const {
            Script
        } = this.props;

        let { showInfoBox, infoBoxRow, infoBoxColumn, infoBoxScript, infoBoxData  } = this.state;

        return (
            showInfoBox &&
            <InfoBox
                onInfoBoxClose={this.onInfoBoxCloseHandler}
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

    // show confirmation popup to refresh data if scroll is enable
    renderConfirmationDialog() {
        const actions = [
            <FlatButton
                label="Stay on Current Page"
                labelStyle={style.button.labelStyle}
                primary={true}
                onClick={ () => this.setState({showConfirmationPopup: false}) }
            />,
            <FlatButton
                label="Continue"
                labelStyle={style.button.labelStyle}
                primary={true}
                onClick={ () => this.updateTableStatus({currentPage: 1, selectedRow: {}, event: events.REFRESH}) }
            />,
        ];

        return (
            this.state.showConfirmationPopup &&
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

    getHeightMargin(showFooter) {
        const {
            configuration,
        } = this.props;

        const {
            searchBar,
            selectColumnOption,
        } = this.getConfiguredProperties();

        let heightMargin = showFooter ? 40 : 0;
        heightMargin = searchBar === false ? heightMargin : heightMargin + 50;        
        heightMargin = configuration.filterOptions ? heightMargin : heightMargin + 10;
        heightMargin = selectColumnOption ? heightMargin + 20 : heightMargin;

        return heightMargin;
    }

    getInitialSort() {
        const {
            sort
        } = this.getGraphProperties();

        let initialSort = {};
        if (sort && sort.column && sort.order) {
            initialSort = {...sort, column: sort.column}
        }

        return initialSort;
    }

    render() {
        const {
            scroll,
            width,
            height,
            data,
        } = this.props;

        const {
            tableData,
            fontSize,
        } = this.state;

        const {
            showCheckboxes,
            hidePagination,
            fixedHeader,
            multiSelectable,
            selectColumnOption,
            searchBar,
        } = this.getConfiguredProperties();

        const {
            pageSize,
            size
        } = this.getGraphProperties();

        const tableCurrentPage = this.currentPage - 1;
        const totalRecords = scroll ? size : this.filterData.length;
        const rowsPerPageSizes = uniq([10, 15, 20, 100, pageSize]);
        const rowsPerPageOptions = rowsPerPageSizes.filter(rowsPerPageSize => rowsPerPageSize < totalRecords);
        const showFooter = (totalRecords <= pageSize && hidePagination !== false && scroll !== true) ? false : true;
        const heightMargin = this.getHeightMargin(showFooter);

        const options = {
            ...this.option,
            rowsSelected: this.state.selected,
            viewColumns: selectColumnOption || false,
            fixedHeaderOptions: { xAxis: false, yAxis: fixedHeader },
            pagination: showFooter,
            rowsPerPage: pageSize,
            count: totalRecords,
            page: tableCurrentPage,
            rowsPerPageOptions: rowsPerPageOptions,
            selectableRows: multiSelectable ? 'multiple' : 'single',
        };

        const muiTableStyle = {
            MUIDataTableSelectCell: {
                root: {
                    display: showCheckboxes ? '' : 'none'
                }
            },
            MUIDataTableBody: {
                emptyTitle: {
                    maxWidth: width
                }
            },
            MUIDataTable: {
                responsiveScrollMaxHeight: {
                    height: (height - heightMargin),
                }
            },
            MUIDataTableToolbar: {
                actions: {
                    marginTop: searchBar || searchBar === undefined ? '-90px' : '0px',
                    marginRight: searchBar || searchBar === undefined ? '-10px' : '0px',
                }
            },
            MuiPaper: {
                elevation4: {
                    boxShadow: (searchBar || searchBar === undefined ? '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)' : '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 0px 0px 0px rgba(0,0,0,0.12)'),
                }
            },
            MUIDataTableToolbarSelect: {
                root: {
                    display: "none"
                }
            },
            MuiTableCell: {
                root: {
                    padding: "10px 20px 10px 15px",
                    fontSize,
                }
            },
            MUIDataTableHeadCell: {
                root: {
                    whiteSpace: 'nowrap',   
                } 
            },
        }

        const theme = createMuiTheme({
            overrides: {...style.muiStyling, ...muiTableStyle}
        });

        return (
            <MuiThemeProvider theme={theme}>
                <div ref={(input) => { this.container = input; }}
                   onContextMenu={this.handleContextMenu}
                >
                    {this.resetScrollData()}
            
                    { this.renderConfirmationDialog()}
                    { this.renderInfoBox() }

                    <div style={{ clear: "both" }}></div>
                    {this.renderSearchBarIfNeeded(this.headerData)}

                    <MUIDataTable
                        data={tableData}
                        columns={this.headerData}
                        options={options}
                    />
                </div>
            </MuiThemeProvider>
        );
    }
}

Table.propTypes = {
    configuration: PropTypes.object,
    response: PropTypes.object
};

export default Table;
