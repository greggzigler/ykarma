import React from 'react';
import { Grid, Row, Col, Panel } from 'react-bootstrap';
import { connect } from 'react-redux'
import { loadAvailableRewards } from '../store/data/actions'
import RewardForm from './RewardForm'

class Spend extends React.Component {

  componentDidMount() {
    this.props.loadAvailableRewards();
  }

  render() {
    return (
        <Grid>
          <Row>
            <Col md={12}>
              <Panel>
                <Panel.Heading>
                  Spend
                </Panel.Heading>
                <Panel.Body>
                  {this.props.rewards.map(reward =>
                    <Row key={reward.id}>
                      {reward.metadata} {reward.cost}
                    </Row>
                  )}
                </Panel.Body>
              </Panel>
              <Panel>
                <Panel.Heading>
                  Add Reward
                </Panel.Heading>
                <Panel.Body>
                  <RewardForm reward = {{}}/>
                </Panel.Body>
              </Panel>
            </Col>
          </Row>
        </Grid>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    user: state.user,
    rewards: state.rewards || [],
  }
}

function mapDispatchToProps(dispatch) {
  return {
    loadAvailableRewards: () => dispatch(loadAvailableRewards()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Spend);
