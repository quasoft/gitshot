import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import TrendingRepositories from './TrendingRepositories';

class App extends Component {
  render() {
    let dates = []
    for (let i = 1; i <= this.props.numberOfDays; i++) {
      let d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d);
    }

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
        <TrendingRepositories dates={dates} />
      </div>
    );
  }
}

export default App;
