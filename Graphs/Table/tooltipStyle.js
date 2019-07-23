const toolTipStyle = {
  wrapper: {
    position: 'relative',
    display: 'inline-block',
    zIndex: '9999',
    color: '#555',
    cursor: 'pointer !important',
  },
  tooltip: {
    position: 'absolute',
    zIndex: '9999',
    background: '#000',
    bottom: '100%',
    WebkitTransform: 'translateX(-50%)',
    msTransform: 'translateX(-50%)',
    OTransform: 'translateX(-50%)',
    transform: 'translateX(-50%)',
    left: '50%',
  },
  content: {
    background: '#000',
    color: '#fff',
    fontSize: '11px',
    padding: '2px',
    whiteSpace: 'nowrap',
  }
}


const lastColToolTipStyle= {
  wrapper: {
    position: 'static',
    display: 'inline-block',
    zIndex: '9999',
    color: '#555',
    cursor: 'pointer !important',
  },
  tooltip: {
    position: 'absolute',
    zIndex: '9999',
    background: '#000',
    bottom: '100%',
    WebkitTransform: 'translateX(-50%)',
    msTransform: 'translateX(-50%)',
    OTransform: 'translateX(-50%)',
    transform: 'translateX(0)',
    left: 'auto',
    right:0,
  },
  content: {
    background: '#000',
    color: '#fff',
    fontSize: '11px',
    padding: '2px',
    whiteSpace: 'nowrap',
  }
}

const firstColToolTipStyle= {
  wrapper: {
    position: 'static',
    display: 'inline-block',
    zIndex: '9999',
    color: '#555',
    cursor: 'pointer !important',
  },
  tooltip: {
    position: 'absolute',
    zIndex: '9999',
    background: '#000',
    bottom: '100%',
    WebkitTransform: 'translateX(-50%)',
    msTransform: 'translateX(-50%)',
    OTransform: 'translateX(-50%)',
    transform: 'translateX(0)',
    left: '0',
    right: 'auto',
  },
  arrow: {
    position: 'absolute',
    top: 'auto',
    left: '10%',
    marginLeft: '-5px',
    borderLeft: 'solid transparent 5px',
    borderRight: 'solid transparent 5px', 
    borderBottom: 'none',
    borderTop: 'solid #000 5px',
    bottom:'-5px',
  },
  content: {
    background: '#000',
    color: '#fff',
    fontSize: '11px',
    padding: '2px',
    whiteSpace: 'nowrap',
  }
}

export {toolTipStyle, lastColToolTipStyle, firstColToolTipStyle}