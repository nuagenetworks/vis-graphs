
import PropTypes from 'prop-types';
import React from "react";
import _ from 'lodash';
import AbstractGraph from "../AbstractGraph";
import { properties } from "./default.config";
import './styles.css'
import { parseSrc } from '@/lib/ui-components/utils.js'
import { netmaskToCIDR } from '@/utils'
import {
    select,
    zoom,
    event,
    tree,
    hierarchy
  } from "d3";


class TreeGraph extends AbstractGraph {

    constructor(props) {
        super(props, properties);
        this.root = null;
        this.treeData = null;
        this.treemap = null;
        this.transformAttr = null;
    }

    componentWillMount() {
        this.initiate(this.props)
    }

    componentDidMount() {
        const {
            data
        } = this.props;

        if (!data)
            return

        this.setSVGTransform(this.props)
        this.elementGenerator();
    }

    componentWillReceiveProps(nextProps) {
        if(!_.isEqual(this.props, nextProps)) {
            this.initiate(nextProps);
        }
    }

    componentDidUpdate() {
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
            data
        } = this.props;

        // declares a tree layout and assigns the size
        this.treemap = tree().size([this.getAvailableHeight(), this.getAvailableWidth()]);
        this.treeData = data[0];
        // Assigns parent, children, height, depth
        this.root = hierarchy(this.treeData, (d) => { return d.children; });
        
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
    }

    removePreviousChart(){
        this.getGraphContainer().selectAll('g.node').remove();
    } 

    componentWillUpdate() {
        this.removePreviousChart();
    }

    updateNodes = (source, nodes) => {
        // update graph
        const svg = this.getGraphContainer();

        const {
            transition: {
                duration
            },
            rectNode
        } = this.getConfiguredProperties();

        let i = 0;

        // ****************** Nodes section ***************************

        // Update the nodes...
        const node = svg.selectAll('g.node')
            .data(nodes, (d) => {
                return d.id || (d.id = ++i);
            });

        // Enter any new modes at the parent's previous position.
        const nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr("transform", (d) => {
                return d.parent ?
                    "translate(" + d.parent.y + "," + d.parent.x + ")" :
                    "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', this.click);

        nodeEnter.append('g').append('rect')
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('width', rectNode.width)
            .attr('height', rectNode.height)
            .attr("stroke", (d) => {
                return d.data.clicked ? rectNode.stroke.selectedColor : rectNode.stroke.defaultColor;
            })
            .attr("stroke-width", rectNode.stroke.width)
            .attr('class', 'node-rect')

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
            .append('xhtml').html((d) => {
                return this.renderRectNode(d);
            })

        // UPDATE
        const nodeUpdate = nodeEnter.merge(node);

        nodeUpdate.select('rect')
            .attr('cursor', 'pointer');

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration((d) => {
                return d.children ? 0 : duration;
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
                return d.clicked ? rectNode.selectedBackground : (d.children || d.data.clicked ? rectNode.selectedBackground : rectNode.defaultBackground);
            });

    }

    renderRectNode = (d) => {
        const {
            rectNode
        } = this.getConfiguredProperties();

        const {
            commonEN
        } = this.props;

        let img = this.fetchImage(d.data.apiData, d.data.contextName);
        const rectColorText = d.children || d.data.clicked ? rectNode.selectedTextColor : rectNode.defaultTextColor
        const colmAttr = rectNode['attributesToShow'][d.data.contextName] ? rectNode['attributesToShow'][d.data.contextName] : rectNode['attributesToShow']['default'];
        
        const displayName = (d.data.name) ? d.data.name.length > 10 ? `${d.data.name.substring(0,10)}...` : d.data.name : 'No Name given';
        const displayDesc = (d.data.description) ? d.data.description.length > 25 ? `${d.data.description.substring(0,25)}...` : d.data.description : commonEN.general.noDescription;

        const CIDR = (colmAttr.address && d.data.apiData._netmask) ? netmaskToCIDR(d.data.apiData._netmask) : ''


        const showImg = img ? `<div style="width:22%;float:left"><img style="width: 20px;" src="${parseSrc(img)}" /></div>` : ''
        const showNameAttr = (colmAttr.name) ? `<div style="width:${showImg ? '78%' : '100%'};float:right;font-size: 10px;color:${rectColorText}">${displayName}</div>` :  '';
        const showDesAttr = (colmAttr.description) ? `<div style="width:78%;float:left;font-size: 8px;margin-top: 4px;color:${rectColorText}">${displayDesc}</div>` :  '';
        const showAddressAttr = (colmAttr.address) ? `<div style="width:78%;float:left;font-size: 8px;margin-top: 4px;color:${rectColorText}">${d.data.apiData._address}/${CIDR}</div>` :  '';
        return `<div style="width: ${(rectNode.width - rectNode.textMargin * 2)}px; height: ${(rectNode.height - rectNode.textMargin * 2)}px;" class="node-text wordwrap">
                    ${showImg}
                    ${showNameAttr}
                    <div style="width:22%;float:left;font-size: 8px;"></div>
                    ${showDesAttr}
                    ${showAddressAttr}
                </div>`
    }

    fetchImage =(apiData, contextName) => {

        const {
            siteIcons
        } = this.props;
        
        if(!siteIcons)
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
            .attr("marker-start", (d) => {
                return d.children || d.data.clicked ? "url(#colored-arrow)" : "url(#normal-arrow)"
            });

        this.normalArrow(svg, linksSettings);
        this.coloredArrow(svg, linksSettings);

        // UPDATE
        const linkUpdate = linkEnter.merge(link);

        linkUpdate.style("stroke", (d) => {
            return d.children || d.data.clicked ? linksSettings.stroke.selectedColor : linksSettings.stroke.defaultColor;
        })

        linkUpdate.transition()
            .duration((d) => {
                return d.children ? 0 : duration;
            })
            .attr('d', (d) => {
                return this.diagonal(d)
            })

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
        const {
            rectNode
        } = this.getConfiguredProperties();

        // Creates a curved (diagonal) path from parent to the child nodes
        var p0 = {
                x: d.x + rectNode.height / 2,
                y: (d.y)
            },
            p3 = {
                x: d.parent.x + rectNode.height / 2,
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
        p = p.map( (d) => {
            return [d.y, d.x];
        });

        return 'M' + p[0] + 'C' + p[1] + ' ' + p[2] + ' ' + p[3];

    }

    parseTransformation = (a) => {
        const b={};
        for (const i in a = a.match(/(\w+\((-?\d+\.?\d*e?-?\d*,?)+\))+/g))
        {
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
    
    render() {
        let { width, height, transformAttr } = this.props;
        if(!transformAttr) {
            transformAttr = this.transformAttr;
        }
        return (
            <div className="line-graph">
                <svg
                    width={width}
                    height={height}
                    ref={ (node) => {
                        this.node = node;
                        select(node)
                        .call(zoom()
                        .scaleExtent([1 / 2, 8])
                        .on("zoom", this.zoomed)
                    )}
                }
                >
                    <g className='tree-graph-container' transform={transformAttr}>

                    </g>
                </svg>
            </div>
        );
    }
}
TreeGraph.propTypes = {
    configuration: PropTypes.object,
    response: PropTypes.object,
    parseData: PropTypes.func,
    fetchChildren: PropTypes.func,
};

export default TreeGraph;
