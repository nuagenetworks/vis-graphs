
import PropTypes from 'prop-types';
import React from "react";
import _ from 'lodash';

import AbstractGraph from "../AbstractGraph";
import { properties } from "./default.config";
import './styles.css'
import {
    select,
    zoom,
    event,
    tree,
    hierarchy
} from "d3";

import * as d3 from "d3";

const EDITOR = 'new';
const DESIGN = 'design';
const TEMPLATE = 'template';

class TreeGraph extends AbstractGraph {

    constructor(props) {
        super(props, properties);
        this.root = null;
        this.treeData = null;
        this.treemap = null;
        this.transformAttr = null;
        this.rectWidth = 0
        this.rectHeight = 0
        this.depth = 0;
        this.module = null;
        this.initiate(props);
    }

    componentDidMount() {
        const {
            data
        } = this.props;

        if (!data || !data.length)
            return

        this.setSVGTransform(this.props)
        this.elementGenerator();
    }

    componentDidUpdate(prevProps) {
        if (!_.isEqual(prevProps, this.props)) {
            this.initiate(this.props);
        }

        const {
            data
        } = this.props;

        if (!data)
            return

        this.setSVGTransform(this.props)
        this.elementGenerator();
    }

    getGraph = () => {
        return this.getSVG();
    }

    getGraphContainer = () => {
        return this.getGraph().select('.tree-graph-container');
    }

    // Toggle children on click.
    click = (d) => {
        d.clicked = true;
        if (d.children) {
            d._children = d.children;
            d.children = null;
            this.collapse(d)
        } else {
            d.children = d._children;
            d._children = null;
            this.props.onClickChild(d);
        }
        this.update(d);
    }

    collapse = (d) => {
        if (d.children) {
            d._children = d.children
            d._children.forEach(this.collapse)
            d.children = null
        }
    }

    // generate methods which helps to create charts
    elementGenerator = () => {
        const {
            data,
            graphType
        } = this.props;
        // declares a tree layout and assigns the size
        this.treemap = tree().size([this.getAvailableHeight(), this.getAvailableWidth()]);
        this.treeData = data[0];

        // Assigns parent, children, height, depth
        this.root = hierarchy(this.treeData, (d) => { return graphType ? d.kids : d.children; });
        //form x and y axis
        this.root.x0 = this.getAvailableHeight() / 2;
        this.root.y0 = 0;
        this.update(this.root)
    }

    setSVGTransform = () => {
        const {
            transformAttr
        } = this.getConfiguredProperties();
        const dx = transformAttr['translate'][0];
        const dy = transformAttr['translate'][1];
        this.transformAttr = `translate(${dx},${dy})`;
    }

    initiate = (props) => {
        this.setAvailableWidth(props);
        this.setAvailableHeight(props);
        this.setSVGTransform();
    }

    setAvailableWidth = (props) => {
        const {
            width
        } = props;
        const {
            margin
        } = this.getConfiguredProperties();
        this.availableWidth = width - margin.left - margin.right
    }

    setAvailableHeight = (props) => {
        const {
            height
        } = props;
        const {
            margin
        } = this.getConfiguredProperties();
        this.availableHeight = height - margin.top - margin.bottom
    }

    update = (source) => {

        const {
            siteIcons: {
                preBtn,
                nextBtn
            },
            graphType
        } = this.props;

        const {
            pagination: {
                paginationIconColor,
                max
            }
        } = this.getConfiguredProperties();


        // Assigns the x and y position for the nodes
        this.treeData = this.treemap(this.root);

        // Compute the new tree layout.
        const nodes = this.treeData.descendants(),
            links = this.treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach((d) => { d.y = d.depth * 180 });

        this.updateNodes(source, nodes);
        this.updateLinks(source, links);

        // Store the old positions for transition.
        nodes.forEach((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        const svg = this.getGraphContainer();

        if (!graphType) {
            // ======================selected nodes notification to show==============================
            this.renderSelectedNodesInfo(nodes)

            // ======================pagination starts here==============================
            const parents = nodes.filter(function (d) {
                return (d.data.kids && d.data.kids.length > max) ? true : false;
            });

            svg.selectAll(".page").remove();

            parents.forEach((p) => {
                if (p.children) {
                    const p1 = p.children[p.children.length - 1];
                    const p2 = p.children[0];

                    const pr = p.data;
                    const pagingData = [];

                    if (pr.page > 1) {
                        pagingData.push({
                            type: "prev",
                            parent: p,
                            no: (pr.page - 1)
                        });
                    }

                    if (pr.page < Math.ceil(pr.kids.length / max)) {
                        pagingData.push({
                            type: "next",
                            parent: p,
                            no: (pr.page + 1)
                        });
                    }

                    const pageControl = svg.selectAll(".page")
                        .data(pagingData, function (d) {
                            return (d.parent.id + d.type);
                        }).enter()
                        .append("g")
                        .attr("class", "page")
                        .attr("transform", function (d) {
                            const x = (d.type === "next") ? p2.y : p1.y;
                            const y = (d.type === "prev") ? (p2.x - 30) : (p1.x + 60);
                            return "translate(" + x + "," + y + ")";
                        }).on("click", this.paginate);

                    pageControl
                        .append("circle")
                        .attr("r", 15)
                        .style("fill", paginationIconColor)

                    pageControl
                        .append("image")
                        .attr("xlink:href", function (d) {
                            if (d.type === "next") {
                                return nextBtn
                            } else {
                                return preBtn
                            }
                        })
                        .attr("x", -12.5)
                        .attr("y", -12.5)
                        .attr("width", 25)
                        .attr("height", 25);

                }
            });
        }
    }

    renderSelectedNodesInfo = (nodes) => {

        const {
            selectedNodesInfo
        } = this.getConfiguredProperties();

        const svg = this.getGraphContainer();
        const selectedNodes = nodes.filter(function (d) {
            return (d.data.clicked) ? true : false;
        });
        if (selectedNodes.length > 1) {
            const line = svg.selectAll(".genealogy")
                .data(selectedNodes, d => d.data);

            const newLine = line.enter()
                .append("g")
                .attr("class", "genealogy");

            let yAxis1 = 5;
            let yAxis2 = 20;

            newLine.append("svg:defs").append("svg:marker")
                .attr("id", "triangle")
                .attr("refX", 6)
                .attr("refY", 6)
                .attr("markerWidth", 30)
                .attr("markerHeight", 30)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M 0 0 12 6 0 12 3 6")
                .style("fill", selectedNodesInfo.stroke);

            newLine.append("line")          // attach a line
                .style("stroke", selectedNodesInfo.stroke)  // colour the line
                .style("opacity", (d, i) => {
                    if (selectedNodes.length === ++i || !d.children) {
                        return 0;
                    }
                })  // colour the line
                .attr("x1", 5)     // x position of the first end of the line
                .attr("y1", (d, i) => {
                    const axisDifference = i > 0 ? 40 : 0;
                    yAxis1 += parseInt(axisDifference)
                    return yAxis1;
                })                  // y position of the first end of the line
                .attr("x2", 5)     // x position of the second end of the line
                .attr("y2", (d, i) => {
                    const axisDifference = i > 0 ? 40 : 0;
                    yAxis2 += parseInt(axisDifference)
                    return yAxis2;
                })
                .attr("marker-end", "url(#triangle)");

            newLine.append("text")
                .attr("dy", (d, i) => {
                    const height = 10 * i * 4;
                    return height;
                })
                .text((d) => d.data.name)
                .style('fill', selectedNodesInfo.fontColor)
                .style('font-weight', 'bold')

            newLine.merge(line);

            let xTra = 0;
            let yTra = 0;

            svg.selectAll('.genealogy')
                .data(selectedNodes)
                .each(function (d) {
                    if (d.children) {
                        const firstChild = d.children[0];
                        if (!firstChild.data.loaded) {
                            xTra = firstChild.x + 40
                            yTra = firstChild.y + 200
                        }
                    } else if (d.data.clicked) {
                        xTra = d.x + 40
                        yTra = d.y + 200
                    }
                })

            d3.selectAll('.genealogy').attr("transform", "translate(" + yTra + "," + xTra + ")");

            line.exit().remove();
        } else {
            svg.selectAll(".genealogy").remove();
        }
    }

    paginate = (d) => {
        d.parent.data.page = d.no;
        this.setPage(d.parent);
    }

    setPage = (d) => {
        if (d && d.data.kids) {
            d.data.children = [];
            d.data.kids.forEach((d1, i) => {
                if (d.data.page === d1.pageNo) {
                    d.data.children.push(d1);
                }
            })
            this.props.onSetPaginatedData(d)
        }
    }

    removePreviousChart() {
        this.getGraphContainer().selectAll('g.node').remove();
    }

    componentWillUpdate() {
        this.removePreviousChart();
    }

    count_leaves = (node) => {
        let count = 0;
        for (var i = 0; i < node.length; i++) {
            if (node[i].children) {
                for (var j = 0; j < node[i].children.length; j++) {
                    if (node[i].children[j].children) {
                        this.count_leaves(node[i].children[j]);
                    }
                    else {
                        count++;
                    }
                }
                return count;
            }
        }
    }

    changleLocation = (d) => {
        d.data.clicked = true;
        const { onSelect } = this.props
        onSelect({ module:d.data.context.moduleName, item: d.data });
    }

    updateNodes = (source, nodes) => {
        // update graph
        const svg = this.getGraphContainer();

        const {
            transition: {
                duration
            },
            rectNode,
            maximumNodesToShowOnPage
        } = this.getConfiguredProperties();

        const {
            commonEN,
            graphType
        } = this.props;

        let i = 0,
            showOnlyImg = false;

        this.rectWidth = rectNode.width;
        this.rectHeight = rectNode.height;

        if (this.count_leaves(nodes) && !graphType) {
            const countLeaves = this.count_leaves(nodes);
            if (countLeaves > maximumNodesToShowOnPage) {
                this.rectWidth = rectNode.smallerWidth;
                this.rectHeight = rectNode.smallerHeight;
                showOnlyImg = true;
            }
        }
        d3.select(".tooltip").remove();
        // Define the div for the tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        // Update the nodes...
        const node = svg.selectAll('g.node')
            .data(nodes, (d) => {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", (d) => {
            return d.parent ?
                "translate(" + d.parent.y + "," + d.parent.x + ")" :
                "translate(" + source.y0 + "," + source.x0 + ")";
        })
        .on("click", (d) => {
            !graphType ? this.click(d) : this.changleLocation(d);
        })
	.on("dragleave", (event) => this.dragLeave(event));

        // ****************** Nodes section ***************************

        nodeEnter.append('g').append('rect')
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('width', this.rectWidth)
            .attr('height', this.rectHeight)
            .attr("stroke", (d) => {
                return d.data.clicked ? rectNode.stroke.selectedColor : rectNode.stroke.defaultColor;
            })
            .attr("stroke-width", rectNode.stroke.width)
            .attr('class', 'node-rect')

        if (showOnlyImg) {
            nodeEnter
                .append("image")
                .attr("xlink:href", (d) => {
                    let img = this.fetchImage(d.data.apiData, d.data.contextName);
                    return img
                })
                .attr("width", 25)
                .attr("height", 25)
                .on("mouseover", function (d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 1)
                        .style("z-index", 1);
                    tooltip.html(`<div style="font-weight:bold;word-wrap: break-word;text-align: center;font-size: 14px;padding: 4px;">${d.data.name}</div> <div style="text-align: justify;word-wrap: break-word;margin-top: 10px;font-size: 12px;padding: 4px;">${(d.data.description) ? d.data.description.length > 25 ? `${d.data.description.substring(0, 100)}...` : d.data.description : commonEN.general.noDescription}</div>`)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                })
                .on("mouseout", function (d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

            nodeEnter.append("text")
                .attr("x", 28)
                .attr("dy", "18px")
                .text(function (d) {
                    return d.data.name;
                })
                .style("fill-opacity", 1);
        } else {
            nodeEnter.append('foreignObject')
                .attr('x', rectNode.textMargin)
                .attr('y', rectNode.textMargin)
                .attr('width', () => {
                    return (rectNode.width - rectNode.textMargin * 2) < 0 ? 0 :
                        (rectNode.width - rectNode.textMargin * 2)
                })
                .attr('height', () => {
                    return (rectNode.height - rectNode.textMargin * 2) < 0 ? 0 :
                        (rectNode.height - rectNode.textMargin * 2)
                })
                .html((d) => {
                    return this.renderRectNode(d);
                })
        }
        // UPDATE
        const nodeUpdate = nodeEnter.merge(node);

        nodeUpdate.select('rect')
            .attr('cursor', 'pointer');

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration((d) => {
                return d.data.loaded ? 0 : duration;
            })
            .attr("transform", (d) => {
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Remove any exiting nodes
        node.exit().transition()
            .duration(duration)
            .attr("transform", (d) => {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeUpdate.select("rect")
            .style("fill", (d) => {
                return d.data.clicked ? rectNode.selectedBackground : rectNode.defaultBackground;
            });

    }

    dragLeave = (event) => {
        const { changePath, getModulePath} = this.props;
        if((this.depth - 1) === event.depth) {
            let path;
            const elementContext = event.data.context.moduleName;
            const id = event.data.ID;
            const contextName = event.data.contextName;
            path = this.changeContextBasedOnSelection(getModulePath, elementContext);
            if(event.parent === null) {
                path = `${path}${elementContext}/${contextName}/${id}/${DESIGN}/${this.module}/${EDITOR}`;
            } else {
                path = `${path}${elementContext}/${contextName}/${id}/${this.module}/${EDITOR}`;
            }
            changePath(path);
        }
    }

    changeContextBasedOnSelection = (contextName, removalContext) => {
        const isRemovalContextPos = contextName.search(removalContext)
        return (isRemovalContextPos !== -1) ? contextName.substr(0, isRemovalContextPos) : contextName
    }

    renderRectNode = (d) => {
        const {
            rectNode
        } = this.getConfiguredProperties();

        const {
            commonEN,
            netmaskToCIDR
        } = this.props;

        const contextName = this.changeContextBasedOnSelection(d.data.contextName, TEMPLATE)

        let img = this.fetchImage(d.data.apiData, contextName);
        const rectColorText = d.data.clicked ? rectNode.selectedTextColor : rectNode.defaultTextColor
        const colmAttr = rectNode['attributesToShow'][contextName] ? rectNode['attributesToShow'][contextName] : rectNode['attributesToShow']['default'];

        const displayName = (d.data.name) ? d.data.name.length > 10 ? `${d.data.name.substring(0, 10)}...` : d.data.name : 'No Name given';
        const displayDesc = (d.data.description) ? d.data.description.length > 25 ? `${d.data.description.substring(0, 25)}...` : d.data.description : commonEN.general.noDescription;

        const CIDR = (colmAttr.address && d.data.apiData._netmask) ? netmaskToCIDR(d.data.apiData._netmask) : ''


        const showImg = img ? `<div style="width:22%;float:left"><img style="width: 20px;" src="${img}" /></div>` : ''
        const showNameAttr = (colmAttr.name) ? `<div style="width:${showImg ? '78%' : '100%'};float:right;font-size: 10px;color:${rectColorText}">${displayName}</div>` : '';
        const showDesAttr = (colmAttr.description) ? `<div style="width:78%;float:left;font-size: 8px;margin-top: 4px;color:${rectColorText}">${displayDesc}</div>` : '';
        const showAddressAttr = (colmAttr.address) ? `<div style="width:78%;float:left;font-size: 8px;margin-top: 4px;color:${rectColorText}">${d.data.apiData._address}/${CIDR}</div>` : '';
        return `<div id="droppableId" onDrop="this.dragended(event)" style="width: ${(rectNode.width - rectNode.textMargin * 2)}px; height: ${(rectNode.height - rectNode.textMargin * 2)}px;" class="node-text wordwrap">
                    ${showImg}
                    ${showNameAttr}
                    <div style="width:22%;float:left;font-size: 8px;"></div>
                    ${showDesAttr}
                    ${showAddressAttr}
                </div>`
    }

    fetchImage = (apiData, contextName) => {
        const {
            siteIcons
        } = this.props;

        if (!siteIcons)
            return false;

        let icon,
            iconType;
        if (contextName === 'zone') {
            iconType = (apiData.publicZone) ? 'publiczone' : 'privatezone'
        }

        if (apiData._avatarData) {
            icon = apiData._avatarData;
        } else if (siteIcons[contextName]) {
            icon = siteIcons[contextName];
        } else if (iconType && siteIcons[iconType]) {
            icon = siteIcons[iconType];
        }
        return icon;
    }

    updateLinks = (source, links) => {
        // update graph
        const svg = this.getGraphContainer();

        const {
            transition: {
                duration
            },
            linksSettings
        } = this.getConfiguredProperties();

        // ****************** links section ***************************
        // Update the links...
        const link = svg.selectAll('path.link').data(links, (d) => {
            return d.id;
        });

        // // Enter any new links at the parent's previous position.
        const linkEnter = link.enter().insert('path', "g")
            .attr("class", "link")
            .attr('d', (d) => {
                return this.diagonal(d)
            })
            .attr("stroke-width", linksSettings.stroke.width)

        this.normalArrow(svg, linksSettings);
        this.coloredArrow(svg, linksSettings);

        // UPDATE
        const linkUpdate = linkEnter.merge(link);

        linkUpdate.style("stroke", (d) => {
            return d.data.clicked ? linksSettings.stroke.selectedColor : linksSettings.stroke.defaultColor;
        })

        linkUpdate.transition()
            .duration((d) => {
                return d.data.loaded ? 0 : duration;
            })
            .attr('d', (d) => {
                return this.diagonal(d)
            })
            .attr("marker-start", (d) => {
                return d.data.clicked ? "url(#colored-arrow)" : "url(#normal-arrow)"
            });

        // Remove any exiting links
        link.exit().transition()
            .duration(duration)
            .attr('d', (d) => {
                return this.diagonal(d)
            })
            .remove();
    }

    normalArrow(svg, linksSettings) {
        svg.append("svg:defs").append('marker')
            .attr('id', 'normal-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 0)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .attr('fill', linksSettings.stroke.defaultColor)
            .append('path')
            .attr('d', 'M10,-5L0,0L10,5');
    }

    coloredArrow(svg, linksSettings) {
        svg.append("svg:defs").append('marker')
            .attr('id', 'colored-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 0)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .attr('fill', linksSettings.stroke.selectedColor)
            .append('path')
            .attr('d', 'M10,-5L0,0L10,5');
    }

    diagonal = (d) => {

        // Creates a curved (diagonal) path from parent to the child nodes
        var p0 = {
            x: d.x + this.rectHeight / 2,
            y: (d.y)
        },
            p3 = {
                x: d.parent.x + this.rectHeight / 2,
                y: d.parent.y - 0 // -12, so the end arrows are just before the rect node
            },
            m = (p0.y + p3.y) / 2,
            p = [p0, {
                x: p0.x,
                y: m
            }, {
                    x: p3.x,
                    y: m
                }, p3];
        p = p.map((d) => {
            return [d.y, d.x];
        });

        return 'M' + p[0] + 'C' + p[1] + ' ' + p[2] + ' ' + p[3];

    }

    parseTransformation = (a) => {
        const b = {};
        for (const i in a = a.match(/(\w+\((-?\d+\.?\d*e?-?\d*,?)+\))+/g)) {
            const c = a[i].match(/[\w.-]+/g);
            b[c.shift()] = c;
        }
        return b;
    }

    zoomed = () => {
        this.getGraphContainer().attr("transform", event.transform);
        const tr = this.getGraphContainer().attr("transform");
        const transformAttr = this.parseTransformation(tr)
        const dx = transformAttr['translate'][0];
        const dy = transformAttr['translate'][1];
        const zm = transformAttr['scale'][0];
        this.props.onHandleTreeGraphOnZoom(`translate(${dx},${dy}) scale(${zm})`)
    }

    dragStart = (event, depth, moduleName) => {
        this.depth = depth;
        this.module = moduleName;
        const svg = this.getGraphContainer();
        svg.selectAll('rect').style('fill', (d) => {
            return d.depth === depth - 1 ? '#96e896' : '#f59999';
        });
    }

    renderAllContext = () => {
        const { treeLayoutStyle, allContexts } = this.props;
        return (
            allContexts.map((val, index) => {
                return (
                    <div style={treeLayoutStyle.libraryBox} key={index} draggable="true" onDragStart={(event) => this.dragStart(event, val.depth, val.moduleName)}>
                        <div style={treeLayoutStyle.libraryImgbox}><img style={{ width: '25px' }} alt={val.name} src={val.icons} /></div>
                        <div style={treeLayoutStyle.libraryTextbox}>{val.name}</div>
                    </div>
                )
            })
        )
    }

    renderTopologyGraph = () => {
        let { height, transformAttr } = this.props;
        if (!transformAttr) {
            transformAttr = this.transformAttr;
        }
        return (
            <div className="line-graph">
                <svg
                    height={height}
                    ref={ (node) => {
                        this.node = node;
                        select(node)
                        .call(zoom()
                        .scaleExtent([1 / 2, 8])
                        .on("zoom", this.zoomed)
                    )}
                    }
                    className="svgWidth"
                >
                    <g className='tree-graph-container' transform={transformAttr}>

                    </g>
                </svg>
            </div>
        )
    }

    renderNetworkGraph = () => {
        let { height, transformAttr, treeLayoutStyle, viewContent } = this.props;
        if(!transformAttr) {
            transformAttr = this.transformAttr;
        }
        
        return (
            <div style={treeLayoutStyle.graphContainer}>
                <div style={treeLayoutStyle.graphView}>
                    <div className="line-graph">
                        <svg
                            height={height}
                            ref={ (node) => {
                                this.node = node;
                                select(node)
                                .call(zoom()
                                .scaleExtent([1 / 2, 8])
                                .on("zoom", this.zoomed)
                            )}
                            }
                            className="svgWidth"
                        >
                            <g className='tree-graph-container' transform={transformAttr}>

                            </g>
                        </svg>
                    </div>
                </div>
                <div style={treeLayoutStyle.contextView} id="sideView">
                    <div style={{height:'60%', borderBottom:'1px solid rgb(242, 242, 242)'}}>
                        {viewContent}
                    </div>
                    <div style={{height:'50%'}}>
                        <div style={treeLayoutStyle.libraryTitle}>Libray</div>
                        <div className="contextContainer" style= {{overflow: 'auto', height: '70%'}} >
                            {this.renderAllContext()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        let { graphType } = this.props;
        return (graphType ? this.renderNetworkGraph() : this.renderTopologyGraph())
    }
}
TreeGraph.propTypes = {
    configuration: PropTypes.object,
    response: PropTypes.object,
    parseData: PropTypes.func,
    fetchChildren: PropTypes.func,
};

export default TreeGraph;
