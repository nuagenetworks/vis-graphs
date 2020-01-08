import React from 'react';
import { styled } from '@material-ui/core/styles';
import { NO_DATA_FOUND } from '../constants';

const Container = styled('div')({
    fontSize: '0.8rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: "100%",
});

const Item = styled('div')({
    padding: '0.8rem',
});

export default () => (WrappedComponent) => (props) => {
    const { data } = props;
    if (!data || !data.length) {
        return (
            <Container>
                <Item>
                    {NO_DATA_FOUND}
                </Item>
            </Container>
        )
    }

    return (
        <WrappedComponent 
          {...props} 
        />
    );
}
