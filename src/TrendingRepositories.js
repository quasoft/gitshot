import React, { Component } from 'react';
import loader from'./loader.gif';
import './TrendingRepositories.css';
import ImageMasonry from 'react-image-masonry';
import axios from 'axios';
import 'nodelist-foreach-polyfill';
import Repository from './Repository.js';

class TrendingRepositories extends Component {
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

  loadRepositories(date) {
    let d = new Date(date);
    d.setDate(d.getDate() - 1);
    let strDate = d.toISOString().slice(0, 10)
    
    let self = this;
    let promise = new Promise(function(resolve, reject) {
      axios.get(self.trendingReposURL(strDate))
      .then(res => {
        // Merge repositories from all three categories
        let merged = res.data.FirstTimers
          .concat(res.data.TopNew)
          .concat(res.data.RepeatPerformers);

        // Remove duplicates
        merged = merged.filter((item, pos) => merged.map(r => r.URL).indexOf(item.URL) === pos);
       
        merged.forEach(repo => {
          // Ignore repositories without a screenshot
          if (repo.Screenshot) {
            self.repositories.push(repo);
          }
        });

        resolve();
      })
      .catch(error => {
        resolve();
      });
    });

    return promise;
  }

  componentDidMount() {
    window.addEventListener("resize", () => {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }
      this.resizeTimer = setTimeout(this.handleWindowResize, 1);
    });
    
    let promises = []
    this.props.dates.forEach((d) => {
      let promise = this.loadRepositories(d);
      promises.push(promise);
    });

    Promise.all(promises)
      .then(() => {
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
      return(
        <div className="loader">
          <div className="inner"><span>Loading ...</span><br/>
            <img src={loader} alt="Loading animation"/>
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
      <div>
        <h2>Trending for the last {this.props.dates.length} days:</h2>
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

export default TrendingRepositories;
