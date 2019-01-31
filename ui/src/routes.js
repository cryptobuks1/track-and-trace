import React, { Component } from 'react'
import { Route } from 'react-router-dom'
import Dashboard from './scenes/Dashboard'
import EnsureAuthenticated from './scenes/EnsureAuthenticated'
import AssetDetail from './scenes/Asset/Detail'

class Routes extends Component {
  render() {
    return (
      <EnsureAuthenticated>
        <Route exact path="/" component={Dashboard} />
        <Route exact path="/asset/:id" component={AssetDetail} />
      </EnsureAuthenticated>
    );
  }
}

export default Routes