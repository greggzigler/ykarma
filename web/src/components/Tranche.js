import React from 'react';
import { connect } from 'react-redux'
import { Row, Col } from 'react-bootstrap';

class Tranche extends React.Component {

  getDetailString = (dict) => {
    var name = dict.name ? dict.name : 'unknown';
    var url = (dict.urls || '').split("||")[0];
    url = url.replace("mailto:",'');
    url = url.replace("https://twitter.com/","@");
    return `${name} (${url})`;
  };

  getSender = () => {
    if (this.props.json.sender === this.props.user.ykid) {
      return "you";
    }
    return this.getDetailString(this.props.json.details);
  };

  getReceiver = () => {
    if (this.props.json.receiver === this.props.user.ykid) {
      return "you";
    }
    return this.getDetailString(this.props.json.details);
  };

  render() {
    return (
      <Row>
        <Col md={12}>
          <Row>
            <Col md={12}>
              &rarr;
              {this.getSender(this.props.json)} sent {this.props.json.amount} karma to {this.getReceiver(this.props.json)} at block {this.props.json.block}
            </Col>
          </Row>
          { this.props.json.message &&
          <Row>
            <Col md={1}>
            </Col>
            <Col md={11}>
              saying <i>{this.props.json.message}</i>
            </Col>
          </Row>}
        </Col>
      </Row>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
  }
}

export default connect(mapStateToProps, null)(Tranche);
