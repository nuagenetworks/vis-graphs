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
        display: 'flex',
        flexWrap: 'wrap',
        fontSize: '.7em'
    },
    labelRow: {
        width: '100%',
        display: 'flex',
        overflow: 'hidden',
        listStyle: 'none'
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
