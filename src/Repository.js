import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Repository extends Component {
  constructor(props) {
    super(props);
    this.container = null;
    this.state = {
      flipped: false
    };
    this.handleImageLoaded = this.handleImageLoaded.bind(this);
  }

  handleImageLoaded(e) {
    let img = ReactDOM.findDOMNode(e.target)
    if (img) {
      let table = this.container.querySelector('table');
      let divs = this.container.querySelectorAll('div');
      if (table && divs) {
        divs.forEach(div => {
          let cardHeight = Math.max(img.clientHeight, table.clientHeight);
          cardHeight = Math.max(cardHeight, 100);
          this.container.style.height = div.style.height = cardHeight + 'px';
        });
      }
    }
  }

  render() {
    return (
      <div className="flip-container tile">
        <div className={`flipper ${this.state.flipped ? 'hover' : ''}`}
             ref={(div) => {if (div) {this.container = div; }}}
             onClick={() => this.setState({flipped: true})}
        >
          <div className="front">
            <span className="helper"></span>
            <img src={this.props.Screenshot} alt={this.props.Name} onLoad={this.handleImageLoaded.bind(this)} />
          </div>
          <div className="back">
            <table className="content">
              <tbody>
                <tr>
                  <td>
                    <a href={this.props.URL}>
                      <span className="repo-title">{this.props.Name}:</span>
                    </a>
                    <br />
                    <span className="repo-desc">{this.props.Description}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default Repository;
