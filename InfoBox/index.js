import PropTypes from 'prop-types';
import React from "react";
import Modal from 'react-modal';
import RaisedButton from 'material-ui/RaisedButton';
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
        <div>
          <div style={style.container}>
            {children}
          </div>
          <div style={style.footer}>
            <RaisedButton
              label="Close"
              backgroundColor={style.button.background}
              labelColor={style.button.label}
              onClick={onInfoBoxClose}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

InfoBox.propTypes =  {
  onInfoBoxClose: PropTypes.func,
};
