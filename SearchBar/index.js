import  React from 'react';
import "react-filter-box/lib/react-filter-box.css";
import _ from 'lodash'
import ReactFilterBox from "react-filter-box";

import "./index.css";
import AutoCompleteHandler from './AutoCompleteHandler';
import AdvancedResultProcessing from './AdvancedResultProcessing';

import CheckCircle  from 'react-icons/lib/fa/check-circle';
import TimeCircle  from 'react-icons/lib/fa/times-circle';
import SearchIcon  from 'react-icons/lib/fa/search';
  
export default class SearchBar extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            data: [],
            isOk: true,
            query: (this.props.searchText && typeof (this.props.searchText) === 'string') ? this.props.searchText : ''
        }

        const {
            options,
            data,
            scroll
        } = this.props
        
        this.autoCompleteHandler = new AutoCompleteHandler(data, options, scroll)
        this.onChange = this.onChange.bind(this)
        this.onParseOk = this.onParseOk.bind(this)
        this.setTimeout = null;
        this.expressions = null;
        this.query = (this.props.searchText && typeof (this.props.searchText) === 'string') ? this.props.searchText : '';
    }

    componentDidMount () {
        const { query } = this.state

        if(query) {
            this.refs.filterBox.onSubmit(query)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(nextProps.data, this.props.data)
          || !_.isEqual(nextState, this.state)
    }

    componentDidUpdate () {
        const { query } = this.state

        if(query) {
            this.refs.filterBox.onSubmit(query)
        }
    }

    onChange (query, result) {
        if(!result.isError) {
            this.query = query;
        }

        this.setState({
            isOk: !result.isError,
            query
        })
    }

    onParseOk(expressions) {
        const {
            options,
            data,
            scroll,
            columns = false
        } = this.props;

        if (!_.isEqual(this.expressions, expressions)) {
            this.expressions = expressions;

            if (this.props.searchText) {
                const filteredData = new AdvancedResultProcessing(options, columns).process(data, expressions)
                this.props.handleSearch(filteredData, this.state.isOk)
            } else { 
                console.error("test")
                clearTimeout(this.setTimeout)
                this.setTimeout = setTimeout(() => {
                    if (scroll) {
                        this.props.handleSearch(data, this.state.isOk, expressions, this.query)
                    } else {
                        const filteredData = new AdvancedResultProcessing(options, columns).process(data, expressions)
                        this.props.handleSearch(filteredData, this.state.isOk)
                    }
                }, 1500);
            }
        }
    }

    renderIcon () {
        var style = {
            marginTop: 10,
            marginLeft: 5
        }

        return this.state.isOk ? <CheckCircle size={20} color="green" style={style}/> : 
        <TimeCircle size={20} style={style} color="#a94442" />
    }

    render() {
        const {
            query
        } = this.state

        const {
            options,
            data
        } = this.props

        return (
           
        <div style={{display: "flex", margin: "10px"}}>
            <div className="search-label">
                Search: &nbsp;
            </div>
            <div className="filter" id="search">
                <ReactFilterBox
                    ref="filterBox"
                    data={data}
                    onChange={this.onChange}
                    autoCompleteHandler={this.autoCompleteHandler}
                    query={query}
                    options={options}
                    onParseOk={this.onParseOk}
                />

                <div className="filter-icon">
                { this.renderIcon() }
                </div>    
            </div>
            
            <div style={{flex: "none"}}>
                <button type="submit" className="search-btn pull-left" disabled={!this.state.isOk}>
                    <SearchIcon size={16} color="#555555" />
                </button>
            </div>
        </div>
        )
    }
}