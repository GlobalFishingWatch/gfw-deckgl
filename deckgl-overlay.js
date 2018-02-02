import React, {Component} from 'react';
// import DeckGL, {LineLayer, ScatterplotLayer} from 'deck.gl';
import DeckGL, {LineLayer} from 'deck.gl';
import ScatterplotLayer from './scatterplot-layer';

export default class DeckGLOverlay extends Component {

  constructor(props) {
    super(props);
    this.state = {
      r: 0
    };
    this._tick = this._tick.bind(this);
  }

  componentDidMount() {
    this._animate();
  }

  _animate() {
    this.intervalTimer = window.setInterval(this._tick, 20);
  }

  _tick() {
    this.setState({r : this.state.r + 1000});
  }

  render() {
    const {viewport, data} = this.props;
    const {r} = this.state;
    console.log(r)
    return (
      <DeckGL
        {...viewport}
        debug
        layers={[
          new LineLayer({
            data: [{sourcePosition: [-122.41669, 37.7853], targetPosition: [-122.41669, 37.781]}]
          }),
          new ScatterplotLayer({
            id: 'scatterplot-layer',
            data,
            radiusScale: 400,
            outline: false,
            opacity: .5,
            innerTimeStart: r,
            innerTimeEnd: r + 1000000
          })
        ]} />
    );
  }
}
