import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { compose } from 'redux';
import {
    select,
    zoom,
    event,
    tree,
    hierarchy
} from 'd3';
import { styled } from '@material-ui/core/styles';

import WithConfigHOC from '../../HOC/WithConfigHOC';
import WithValidationHOC from '../../HOC/WithValidationHOC';
import { config } from './default.config';
import './styles.css';
import { isFunction } from '../../utils/helpers';
import { isEmpty } from 'lodash';

let root = null;
let treeData = null;
let treemap = null;
let transformAttribute = null;
let rectWidth = 0;
let rectHeight = 0;
let availableWidth = 0;
let availableHeight = 0;

const TooltipFirstRow = styled('small')({
    fontWeight: 'bold',
    fontSize: '10px',
    wordWrap: 'break-word',
    textAlign: 'center',
    padding: '4px',
    color: '#000000;',
});

const TooltipSecondRow = styled('small')({
    textAlign: 'justify',
    wordWrap: 'break-word',
    marginTop: '10px',
    fontSize: '9px',
    padding: '4px',
    color: '#000000',
});

const setAvailableWidth = (width, margin) => width - (margin.left + margin.right);

const setAvailableHeight = (height, margin) => height - (margin.top + margin.bottom);

const setSVGTransform = (properties) => {
    const { transformAttr } = properties;
    const dx = transformAttr['translate'][0];
    const dy = transformAttr['translate'][1];
    return `translate(${dx},${dy})`;
}

const showToolTip = (tooltip, d, showToolTip, commonEN) => {
    const tooltipContent = (`<TooltipFirstRow> 
                                ${d.data.name} 
                            </TooltipFirstRow>
                            <br/> 
                            <TooltipSecondRow>
                                ${(d.data.description) ? d.data.description : commonEN.general.noDescription}
                            </TooltipSecondRow>`);
    if (showToolTip) {
        tooltip.transition()
            .duration(200)
            .style('opacity', 5);

        // todo
        tooltip.html(tooltipContent)
            .style('left', (event.pageX) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    }
}

const hideToolTip = tooltip => {
    tooltip.transition()
        .duration(500)
        .style('opacity', 0);
}

const collapse = d => {
    if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
    }
}

const parseTransformation = a => {
    const b = {};
    for (const i in a = a.match(/(\w+\((-?\d+\.?\d*e?-?\d*,?)+\))+/g)) {
        const c = a[i].match(/[\w.-]+/g);
        b[c.shift()] = c;
    }
    return b;
}

const diagonal = d => {

// Creates a Line (diagonal) path from parent to the child nodes
    let p0 = {
        x: d.x + rectHeight / 2,
        y: (d.y)
    },
        p3 = {
            x: d.parent.x + rectHeight / 2,
            y: d.parent.y + 180 // -12, so the end arrows are just before the rect node
        },
        m = (p0.y + p3.y) / 2,
        p = [p0, {
            x: p0.x,
            y: m
        }, {
                x: p3.x,
                y: m
            }, p3];
    p = p.map(d => [d.y, d.x]);

    return 'M' + p[0] + 'L' + p[1] + ' ' + p[2] + ' ' + p[3];
}

const normalArrow = (svg, linksSettings) => {
    svg.append('svg:defs').append('marker')
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

const coloredArrow = (svg, linksSettings) => {
    svg.append('svg:defs').append('marker')
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

const renderRectNode = (d, props, rectNode) => {
    const {
        renderNode,
        store,
        theme,
        ...rest
    } = props;

    if (!isFunction(renderNode)) return '<div/>';

    const rectColorText = d.data.clicked ? rectNode.selectedTextColor : rectNode.defaultTextColor;

    return renderNode(
        {   theme,
            data: d.data,
            textColor: rectColorText,
            nodeId: `node-${d.id}`,
            store,
            ...rectNode,
            onItemRender: () => (rest)
        }
    );
}

const TreeGraph = (props) => {
    const {
        data,
        properties,
        graphRenderView,
        siteIcons: {
            preBtn,
            nextBtn
        },
        commonEN,
        OnSetDragging,
        onHandleTreeGraphOnZoom,
        onClickChild,
        updateTreeData,
    } = props;

    const {
        margin,
        pagination: {
            paginationIconColor,
            max
        },
        transition: {
            duration
        },
        rectNode,
        maximumNodesToShowOnPage,
        linksSettings,
        xLabelRotateHeight,
        xLabelRotate,
    } = properties;

    const isFirst = useRef(true);
    const [nodeElement, setNodeElement] = useState(null);
    const [nodes, setNodes] = useState(null);

    const kids = Array.isArray(props.data) && props.data.length ? props.data[0].kids : null;

    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            if (!nodeElement) return;
        } else {
            nodeElement && removePreviousChart();
        }
        if (nodeElement) {
            nodeElement && removePreviousChart()
            initiate(props);
            transformAttribute = setSVGTransform(properties);
            elementGenerator();
            setDraggingRef(props);
        }
    }, [props, nodeElement, kids]);

    // Toggle children on click.
    const click = d => {
        let collapseTree = false;
        d.clicked = true;
        if (d.children) {
            d._children = d.children;
            d.children = null;
            collapse(d);
            collapseTree = true;
        } else {
            d.children = d._children;
            d._children = null;
        }
        onClickChild(d, collapseTree);
        update(d);
    }

    const getGraph = () => select(nodeElement);

    const getGraphContainer = () => getGraph().select('.tree-graph-container');

    const removePreviousChart = () => {
        getGraphContainer().selectAll('g.node').remove();
    }

    const getAvailableHeight = () => {
        return availableHeight - (xLabelRotate ? xLabelRotateHeight : 0);
    }

    // generate methods which helps to create charts
    const elementGenerator = () => {

        // declares a tree layout and assigns the size
        treemap = tree().size([getAvailableHeight(), availableWidth]);
        treeData = data[0];

        // Assigns parent, children, height, depth
        root = hierarchy(treeData, d => { return graphRenderView ? d.kids : d.children; });
        //form x and y axis
        root.x0 = getAvailableHeight() / 2;
        root.y0 = 0;
        update(root);
    }

    const initiate = (props) => {
        const {
            width,
            height,
        } = props;

        availableWidth = setAvailableWidth(width, margin);
        availableHeight = setAvailableHeight(height, margin);
        transformAttribute = setSVGTransform(properties);
    }

    const update = (source) => {

        // Assigns the x and y position for the nodes
        treeData = treemap(root);

        // Compute the new tree layout.
        const nodes = treeData.descendants();
        const links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(d => { d.y = d.depth * 250 });

        updateNodes(source, nodes);
        updateLinks(source, links);

        // Store the old positions for transition.
        nodes.forEach(d => {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        const svg = getGraphContainer();

        // ======================pagination starts here==============================
        const parents = nodes.filter(d => {
            if (graphRenderView) {
                return (d.data.pagination) ? true : false;
            }
            return (d.data.kids && d.data.kids.length > max) ? true : false;
        });

        svg.selectAll('.page').remove();

        parents.forEach(p => {
            if (p.children) {
                const p1 = p.children[p.children.length - 1];
                const p2 = p.children[0];
                const pr = p.data;
                const pagingData = [];

                if (graphRenderView) {
                    if (p2.data.pageNumber > 1) {
                        pagingData.push({
                            type: 'prev',
                            parent: p,
                            module: p2.data.context.moduleName,
                            no: (p2.data.pageNumber - 1)
                        });
                    }

                    if (p1.data.pageNumber < p1.data.totalPages) {
                        pagingData.push({
                            type: 'next',
                            parent: p,
                            module: p2.data.context.moduleName,
                            no: (p1.data.pageNumber + 1)
                        });
                    }
                } else {
                    if (pr.page > 1) {
                        pagingData.push({
                            type: 'prev',
                            parent: p,
                            no: (pr.page - 1)
                        });
                    }

                    if (pr.page < Math.ceil(pr.kids.length / max)) {
                        pagingData.push({
                            type: 'next',
                            parent: p,
                            no: (pr.page + 1)
                        });
                    }
                }

                const pageControl = svg.selectAll('.page')
                    .data(pagingData, d => {
                        return (d.parent.id + d.type);
                    }).enter()
                    .append('g')
                    .attr('class', 'page')
                    .attr('transform', d => {
                        const x = (d.type === 'next') ? p2.y : p1.y;
                        const y = (d.type === 'prev') ? (p2.x - 30) : (p1.x + 60);
                        return `translate(${x}, ${y})`;
                    }).on('click', paginate);

                pageControl
                    .append('circle')
                    .attr('r', 15)
                    .style('fill', paginationIconColor);

                pageControl
                    .append('image')
                    .attr('xlink:href', d => d.type === 'next' ? nextBtn : preBtn)
                    .attr('x', -12.5)
                    .attr('y', -12.5)
                    .attr('width', 25)
                    .attr('height', 25);
            }
        });
    }

    const paginate = d => {
        if (graphRenderView) {
            updateTreeData(d);
        } else {
            if (d && d.parent) {
                d.parent.data.page = d.no;
                setPage(d.parent);
            }
        }
    }

    const setPage = d => {
        const data = d.data;
        if (d && data.kids) {
            data.children = [];
            data.kids.forEach((d1, i) => {
                if (data.page === d1.pageNo) {
                    data.children.push(d1);
                }
            })
            props.onSetPaginatedData(d);
        }
    }

    const count_leaves = (node) => {
        let count = 0;
        for (let i = 0; i < node.length; i++) {
            const child = node[i].children;
            if (child) {
                if (child.length > count) {
                    count = child.length;
                }
            }
        }
        return count;
    }

    const setDraggingRef = (props) => {
        if (props.onDragStartRef) {
            props.onDragStartRef(dragStart);
        }
    }

    const dragStart = (event, depth, moduleName, subModule) => {
        const svg = getGraphContainer();
        OnSetDragging(depth, moduleName, svg, subModule);
    }

    const updateNodes = (source, nodes) => {
        // update graph
        const svg = getGraphContainer();
        let i = 0;
        let showOnlyImg = false;

        rectWidth = rectNode.width;
        rectHeight = rectNode.height;

        if (count_leaves(nodes)) {
            const countLeaves = count_leaves(nodes);
            if (countLeaves > maximumNodesToShowOnPage) {
                rectWidth = rectNode.smallerWidth;
                rectHeight = rectNode.smallerHeight;
                showOnlyImg = true;
            }
        }
        select('.tooltip').remove();
        // Define the div for the tooltip
        const tooltip = select('body').append('div')
            .attr('class', 'tooltip')
            .style('background', '#F2F2F2')
            .style('opacity', 0);

        // Update the nodes...
        const node = svg.selectAll('g.node')
            .data(nodes, d => {
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', d => d.parent ? `translate(${d.parent.y}, ${d.parent.x})` : `translate(${source.y0}, ${source.x0})`)
            .on('dragleave', event => props.OnSubmitFormOnDragLeave(event));

        // ****************** Nodes section ***************************

        if (showOnlyImg) {
            nodeEnter
                .attr('width', 25)
                .attr('height', 25)
                .on('mouseover', d => showToolTip(tooltip, d, true, commonEN))
                .on('mouseout', d => hideToolTip(tooltip, d));

            nodeEnter.append('text')
                .attr('x', 28)
                .attr('dy', '18px')
                .text(d => d.data.name && d.data.name.length > 23 ? `${d.data.name.substring(0, 23)}...` : d.data.name)
                .style('fill-opacity', 1);
        } else {
            nodeEnter.append('g').append('rect')
                .attr('rx', 0)
                .attr('ry', 0)
                .attr('width', rectWidth)
                .attr('height', rectHeight)
                .attr('stroke', d => d.data.clicked ? rectNode.stroke.selectedColor : rectNode.stroke.defaultColor)
                .attr('stroke-width', rectNode.stroke.width)
                .attr('class', 'node-rect')

            nodeEnter.append('foreignObject')
                .attr('id', d => `node-${d.id}`)
                .attr('width', rectWidth)
                .attr('height', rectHeight)
                .on('mouseover', d => showToolTip(tooltip, d, (d.data.name && d.data.name.length > 23) || (d.data.description && d.data.name.description > 24), commonEN))
                .on('mouseout', d => hideToolTip(tooltip, d));
        }
        // UPDATE
        const nodeUpdate = nodeEnter.merge(node);
        setNodes(nodes);

        nodeUpdate.select('rect')
            .attr('cursor', 'pointer');

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(d => d.data.loaded ? 0 : duration)
            .attr('transform', d => `translate(${d.y}, ${d.x})`);

        // Remove any exiting nodes
        node.exit().transition()
            .duration(duration)
            .attr('transform', () => `translate(${source.y}, ${source.x})`)
            .remove();

        nodeUpdate.select('rect')
            .style('fill', d => d.data.clicked ? rectNode.selectedBackground : rectNode.defaultBackground);
    }

    const updateLinks = (source, links) => {
        // update graph
        const svg = getGraphContainer();

        // ****************** links section ***************************
        // Update the links...
        const link = svg.selectAll('path.link').data(links, d => d.id);

        // // Enter any new links at the parent's previous position.
        const linkEnter = link.enter().insert('path', 'g')
            .attr('class', 'link')
            .attr('d', d => diagonal(d))
            .attr('stroke-width', linksSettings.stroke.width)

        normalArrow(svg, linksSettings);
        coloredArrow(svg, linksSettings);

        // UPDATE
        const linkUpdate = linkEnter.merge(link);
        const highlight = linkUpdate.filter(d => d.data.clicked);
        highlight.raise();

        linkUpdate.style('stroke', d => {
            return d.data.clicked ? linksSettings.stroke.selectedColor : linksSettings.stroke.defaultColor;
        })

        linkUpdate.transition()
            .duration(d => d.data.loaded ? 0 : duration)
            .attr('d', d => diagonal(d))
            .attr('marker-start', d => d.data.clicked ? 'url(#colored-arrow)' : 'url(#normal-arrow)');

        // Remove any exiting links
        link.exit().transition()
            .duration(duration)
            .attr('d', d => diagonal(d))
            .remove();
    }

    const zoomed = () => {
        getGraphContainer().attr('transform', event.transform);
        const tr = getGraphContainer().attr('transform');
        const transformAttr = parseTransformation(tr)
        const dx = transformAttr['translate'][0];
        const dy = transformAttr['translate'][1];
        const zm = transformAttr['scale'][0];
        onHandleTreeGraphOnZoom(`translate(${dx},${dy}) scale(${zm})`);
    }

    let {
        transformAttr = transformAttribute,
    } = props;

    return (
        <div className='tree-graph' style={{ height: '100%', background: '#FCFCFC' }}>
            {!isEmpty(nodes) && nodes.map((node) => {
                return (
                    <div onClick={() => !graphRenderView ? click(node) : props.OnChangleContext(node)}>
                        { renderRectNode(node, props, rectNode)}
                    </div>
                );
            })}
            <svg
                height={'100%'}
                className='svgWidth'
                ref={(node) => {
                    setNodeElement(node);
                    select(node)
                        .call(zoom()
                            .scaleExtent([1 / 2, 8])
                            .on('zoom', zoomed)
                        )
                }
                }
            >
                <g className='tree-graph-container' transform={transformAttr}></g>
            </svg>
        </div>
    )
}
TreeGraph.propTypes = {
    configuration: PropTypes.object,
    response: PropTypes.object,
    parseData: PropTypes.func,
    fetchChildren: PropTypes.func,
};

export default compose(
    WithValidationHOC(),
    (WithConfigHOC(config))
)(TreeGraph);
