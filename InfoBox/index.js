import PropTypes from 'prop-types';
import React from "react";
import Modal from 'react-modal';
import * as d3 from 'd3';

import style from './styles';

export default class InfoBox extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      modalIsOpen: true
    };

    d3.select('body').append('div').attr('id', 'table-infobox-popup');
    Modal.setAppElement('#table-infobox-popup');
  }

  componentWillUnmount() {
    d3.select('#table-infobox-popup').remove();
  }

  render() {
    const { onInfoBoxClose, children } = this.props;
    const { modalIsOpen } = this.state;

    return (
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={onInfoBoxClose}
            style={style.modal}
        >
          <React.Fragment>
            <div style={{float: 'right', fontSize: '28px',fontWeight: 'bold', marginRight: '5px', cursor: 'pointer'}} onClick={onInfoBoxClose}>&times;</div>
            <div style={style.container}>
              {children}
            </div>
          </React.Fragment>
        </Modal>
    );
  }
}

InfoBox.propTypes =  {
  onInfoBoxClose: PropTypes.func,
};
