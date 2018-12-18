import { theme } from '../../theme';

const styles = {
    container: {
        display: 'flex',
        verticalAlign: 'middle',
        flexFlow: 'row wrap',
    },
    iconContainer: {
        display: 'contents',
        overflow: 'auto',
    },
    labelContainer: {
        width: '100%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gridGap: '5px',
        margin: '10px 10px 0px 10px'
    },
    labelBox: {
        padding: '5px'
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
