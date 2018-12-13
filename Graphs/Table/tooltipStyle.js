export default {
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
