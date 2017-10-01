import React from 'react';
import {BrowserRouter as Router, Route, Link, Redirect, Switch, withRouter} from 'react-router-dom';

import Selector from './Selector.jsx';
import List from './List.jsx';

import Main from './main.jsx';
import HDViewer from './hd-viewer.jsx';

export default class APOD extends React.Component{
  render(){
    return (
      <div>


        <Router>
          <Switch>
            <Route exact path='/apod/hd/:date' component={withRouter(HDViewer)} />
            <Route exact path='/apod/:date' component={withRouter(Main)} />
            <Redirect from='/' to={`/apod/${new Date().toISOString().replace(/\T([0-9]{2,3}:)*[0-9]*.[0-9]{2,3}Z/, '')}`} />
          </Switch>
        </Router>


      </div>
    );
  }
}
