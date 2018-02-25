import React, { Component } from 'react';
import logo from './logo.svg';
import loader from'./loader.gif';
import './App.css';
import ImageMasonry from 'react-image-masonry';
import axios from 'axios';
import 'nodelist-foreach-polyfill';
import Repository from './Repository.js';

class App extends Component {
  constructor(props) {
    super(props);
    this.repositories = [];
    this.state = {
      ready: false,
      repositories: [],
      windowWidth: this.getWindowWidth()
    };
    this.resizeTimer = null;
    this.handleWindowResize = this.handleWindowResize.bind(this);
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
    this.setState({windowWidth: width});
    this.forceUpdate();
  }

  trendingReposURL(date) {
    return `https://raw.githubusercontent.com/quasoft/trending-daily/master/${date}.json`;
  }

  loadRepositories() {
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

  componentDidMount() {
    window.addEventListener("resize", () => {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }
      this.resizeTimer = setTimeout(this.handleWindowResize, 1);
    });
    
    this.loadRepositories();
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
      return(
        <div id="waiting-overlay" class="waiting overlay">
          <div class="loader">
            <div class="inner"><span>GitShot loading...</span><br/><img src={loader} />
            </div>
          </div>
        </div>
      );
    }

    let numberOfColumns = 3;
    if (this.state.windowWidth < 480)
      numberOfColumns = 1
    else if (this.state.windowWidth < 800)
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
              <Repository
                key={i}
                Name={repo.Name}
                URL={repo.URL}
                Screenshot={repo.Screenshot}
                Description={repo.Description}
              />
            );
          })}
        </ImageMasonry>
      </div>
    );
  }
}

export default App;
