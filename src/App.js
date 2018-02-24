import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ImageMasonry from 'react-image-masonry';
import axios from 'axios';
import ReactDOM from 'react-dom';

class App extends Component {
  constructor(props) {
    super(props);
    this.repositories = [];
    this.flippers = {};
    this.state = {
      ready: false,
      repositories: [],
      width: this.getWindowWidth()
    };
    this.resizeTimer = null;
    this.handleImageLoaded = this.handleImageLoaded.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
  }

  handleImageLoaded(e) {
    // Update height of the flipper container to that of the image
    let img = ReactDOM.findDOMNode(e.target)
    if (img) {
      let flipper = img.parentElement.parentElement;
      let table = flipper.querySelector('table');
      let divs = flipper.querySelectorAll('div');
      if (table && divs) {
        divs.forEach(div => {
          let cardHeight = Math.max(img.clientHeight, table.clientHeight);
          cardHeight = Math.max(cardHeight, 100);
          let px = cardHeight + 'px';
          this.flippers[flipper.id].style.height = px;
          div.style.height = px;
        });
      }
    }
  }

  getWindowWidth() {
    let w = window,
    d = document,
    documentElement = d.documentElement,
    body = d.querySelector('body'),
    width = w.innerWidth || documentElement.clientWidth || body.clientWidth;
    return width
  }

  handleWindowResize() {
    let width = this.getWindowWidth();
    this.setState({width: width});
    this.forceUpdate();
  }

  trendingReposURL(date) {
    return `https://raw.githubusercontent.com/quasoft/trending-daily/master/${date}.json`;
  }

  componentDidMount() {
    window.addEventListener("resize", () => {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }
      this.resizeTimer = setTimeout(this.handleWindowResize, 1);
    });
    
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday = yesterday.toISOString().slice(0, 10)

    axios.get(this.trendingReposURL(yesterday))
      .then(res => {
        // Merge repositories from all three categories
        let merged = res.data.FirstTimers
          .concat(res.data.TopNew)
          .concat(res.data.RepeatPerformers);

        // Remove duplicates
        merged = merged.filter((item, pos) => merged.map(r => r.URL).indexOf(item.URL) === pos);
       
        let self = this;
        merged.forEach(repo => {
          // Ignore repositories without a screenshot
          if (repo.Screenshot) {
            self.repositories.push(repo);
          }
        });

        this.setState({ repositories: this.repositories });
        this.setState({ ready: true });
      });
  }

  componentWillUnmount() {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = null;
    }
    window.addEventListener("resize", null);
  }

  render() {
    if (!this.state.ready) {
      return <div>Loading...</div>;
    }

    let numberOfColumns = 3;
    if (this.state.width < 480)
      numberOfColumns = 1
    else if (this.state.width < 800)
      numberOfColumns = 2;

    return (
      <div className="App">
        <header className="App-header">
          <a href="https://github.com/quasoft/gitshot"><img src={logo} className="App-logo" alt="logo" /></a>
          <h1 className="App-title"><a href="https://github.com/quasoft/gitshot">GitShot</a> - Explore trending repositories in screenshots</h1>
          <p className="App-intro">
            Populated with images of repositories featured in <span className="changelog"><a href="https://changelog.com/nightly">The Changelog Nightly</a></span>.
            Hover an image to see more details about the repo.
          </p>
        </header>
        <ImageMasonry
          numCols={numberOfColumns}
          containerWidth={"100%"}
        >
        {this.state.repositories.map((repo, i) => {
          return (
          <div key={i} className="flip-container tile">
          <div id={`flipper${i}`} className="flipper" ref={(div) => {if (div) {this.flippers[div.id] = div; }}} onTouchStart={() => this.classList.toggle('hover')} >
            <div className="front" id={`front${i}`}>
              <span className="helper"></span><img src={repo.Screenshot} alt={repo.Name} onLoad={this.handleImageLoaded.bind(this)} />
            </div>
            <div className="back" id={`back${i}`}>
              <table className="content">
              <tbody>
                <tr>
                  <td>
                    <a href={repo.URL}>
                      <span className="repo-title">{repo.Name}:</span>
                    </a>
                    <br />
                    <span className="repo-desc">{repo.Description}</span>
                  </td>
                </tr>
              </tbody>
              </table>
            </div>
          </div>
          </div>
        );
        })}
        </ImageMasonry>
      </div>
    );
  }
}

export default App;
