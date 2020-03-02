import React from 'react';
import { styled } from '@material-ui/core/styles';

const SvgContainer = styled('div')({
    display: 'inline-block',
    position: 'relative',
    width: ({ resizeWithWindow, width } = {}) => !resizeWithWindow ? width :'100%',
    paddingBottom: '100%',
    verticalAlign: 'top',
    overflow: 'hidden',
    height:({ resizeWithWindow, height } = {}) => !resizeWithWindow ? height :'',
});

export default ({
    width,
    height,
    clearHover,
    children,
    resizeWithWindow,
    onClick,
    id,
}) => (
    <SvgContainer className="svg-container"
        resizeWithWindow={resizeWithWindow} 
        width={width}
        height={height}
    >
        <svg
            className={`svg-content`}
            viewBox={`-${width / 2} -${height / 2} ${width} ${height}`}
            preserveAspectRatio={"xMidYMid meet"}
            data-tip
            data-for={id}
        >
            <g>
              <rect
                fillOpacity={0}
                height={height}
                onClick={ (event) => { clearHover(); onClick(event) } }
                width={width}
                x={`-${width / 2}`}
                y={`-${height / 2}`}
              />
                { children }
            </g>
        </svg>
    </SvgContainer>
);
