import { theme } from '../../theme';

const styles = {
    container: {
        display: 'flex',
        verticalAlign: 'middle',
        flexFlow: 'row wrap',
        overflow: 'auto',
    },
    iconContainer: {
        display: 'contents',
    },
    labelContainer: {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
        gridGap: '5px',
        margin: '0px 10px 0px 10px',
        fontSize: '1em'
    },
    labelRow: {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
        gridGap: '5px',
        margin: '0px 10px 0px 10px',
        gridColumn: '1 / -1'
    },
    labelBox: {
        padding: '2px'
    },
    row: {
        display: 'flex',
        flexFlow: 'row nowrap',
        marginTop: '10px'
    },
    portBox: {
        textAlign: 'center',
        marginBottom: 5,
    },
    borderRight: `1px solid ${theme.palette.greyLightColor}`,
}

export default styles;
