export default {
    container: {
        display: 'flex',
        flexDirection: 'nowrap',
        flexWrap: 'wrap',
        alignItems: 'center',
        alignContent: 'center',
        overflowY: 'auto',
    },
    section: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    upperText: {
        fontSize: '10px',
        order: 1,
        marginBottom: '-2px',
    },
    lowerText: {
        fontSize: '10px',
        order: 2,
        flex: 'auto'
    },
    barSection: {
        order: 2,
        display: 'flex',
    },
    innerBarSection: {
        order: 1,
        flex: 1
    }
}
