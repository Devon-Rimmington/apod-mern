import React from 'react';

import GoogleLogin from 'react-google-login';

import Viewer from './viewer.jsx';
import Picker from './picker.jsx';

export default class Main extends React.Component {

  constructor(props) {
    super(props);
    console.log(props.location.search.replace(/\?page\=/, ''));
    // set the current date for the viewer
    this.state = ({todaysDate: new Date().toISOString().replace(/\T([0-9]{2,3}:)*[0-9]*.[0-9]{2,3}Z/, ''),
      date: (props.match.params.date ? props.match.params.date : new Date().toISOString().replace(/\T([0-9]{2,3}:)*[0-9]*.[0-9]{2,3}Z/, '')),
      startDate: new Date('1995-07-20').toISOString().replace(/\T([0-9]{2,3}:)*[0-9]*.[0-9]{2,3}Z/, ''),
      key: (Number(props.location.search.replace(/\?date=/, '')) ? Number(props.location.search.replace(/\?date=/, '')) : 1), title: 'Welcome to the Astronomy Picture of the Day!',
      signedIn: false, usersname: ''});

    this.handleNext = this.handleNext.bind(this);
    this.handlePrevious = this.handlePrevious.bind(this);
    this.handleKey = this.handleKey.bind(this);
    this.handleTitle = this.handleTitle.bind(this);
    this.signIn = this.signIn.bind(this);
    this.signOut = this.signOut.bind(this);
    this.signInStatus = this.signInStatus.bind(this);
  }

  componentDidUpdate(prevProps) {
    console.log('prev props ' + JSON.stringify(prevProps));
    if(prevProps.match.params.date !== this.props.match.params.date) {
      this.setState({date: this.props.match.params.date});
      // console.log(prevProps.match.params.date + ' ' + this.props.match.params.date);
    }
  }

  componentDidMount() {
    window.gapi.load('auth2', () => {
      if(!window.gapi.auth2.getAuthInstance()) {
        window.gapi.auth2.init({clientId: '906357840720-15omrini6c7k1kmr6su2kgqh61dopp8f.apps.googleusercontent.com'}).then(() => {});
      }
    });
    // checks if the user has a cookie already and wether or not they need to sign-in
    this.signInStatus();
  }

  handleTitle(title) {
    this.setState({title: title});
  }

  handleNext() {
    // get the date
    let date = new Date(this.state.date);
    // increase the date
    date.setDate(date.getDate() + 1);
    // console.log('next');
    // if the date is not today allow the date to be increased
    if(new Date(this.state.todaysDate).getTime() >= date.getTime()) {
        // push the new date to the router which will redirect to page and update the state
        this.props.history.push('/apod/'+date.toISOString().replace(/\T([0-9]{2,3}:)*[0-9]*.[0-9]{2,3}Z/, '') + '?page=' + this.state.key);
        // console.log('next date ' + date);
    }
  }

  handlePrevious() {
    // get the date
    let date = new Date(this.state.date);
    // decrease the date
    date.setDate(date.getDate() - 1);
    console.log('previous');
    // if the date is not the start of the apod archive than allow the date to be decreased
    if(new Date(this.state.startDate).getTime() <= date.getTime()) {
        // push the new date to the router which will redirect to page and update the state
        this.props.history.push('/apod/'+date.toISOString().replace(/\T([0-9]{2,3}:)*[0-9]*.[0-9]{2,3}Z/, '') + '?page=' + this.state.key);
        // console.log('previous date ' + date);
      }
  }

  handleKey(key) {
    // console.log('key2 ' + key);
    this.props.history.push({
      search: '?page=' + key
    });
    this.setState({key: key});
  }

  signInStatus() {
    // check if the state of the user is signed in
    if(!this.state.signedIn) {
      // define the options for the http request
      let options = {
        'method': 'GET',
        'credentials': 'include', // include the cookie in the http
        'headers': {
          'Content-Type': 'application/json'
        }
      };
      // get the current sign in status
      fetch('/api/status', options).then(
        (response) => {
          if(response.ok) {
            return response.json()
          }
          else {
            throw response.json();
          }
      }).then((response) => {
        // set the signin state to be true and set the username
        this.setState({signedIn: true, usersname: response.usersname});
      }).catch((error) => {
        this.setState({signedIn: false});
        console.log(error);
      });
    }
  }

  signIn() {

    alert('Warning!!! currently this website does not use SSL to encrypt the web traffic leaving your data vulernable to hackers. I recommend not signing in until an SSL certificate has been added');

    // check if the state of the user is signed in
    if(!this.state.signedIn) {
      // access the google oauth api
      const auth2 = window.gapi.auth2.getAuthInstance();
      // invoke the google signin process
      auth2.signIn().then((googleUser) => {

        console.log(googleUser);

        // define the body and the header options for http request
        let body = {
          id_token: googleUser.getAuthResponse().id_token,
          usersname: googleUser.w3.ig,
        };
        let options = {
          'method':'POST',
          'credentials': 'include',
          'headers':{'Content-Type':'application/json'},
          'body':JSON.stringify(body)
        };
        // perform the http fetch
        fetch('/api/login', options).then((response) =>
        {
          if(response.ok) {
            return response.json();
          }
          else {
            throw response.json();
          }
        }).then((response) => {
          // set the signin state to be true and set the username
          this.setState({signedIn: true, usersname: response.usersname});
        }).catch((error) => {
          this.setState({signedIn: false});
          console.log('error ' + error);
        });
      });
    }
  }

  // destroy the session in the server
  signOut() {
    // check if the state of the user is signed in
    if(this.state.signedIn){
      // define the body and the header options for http request
      let body = JSON.stringify({});
      let options = {
        'method':'POST',
        'credentials': 'include',
        'headers': {
          'Content-Type': 'application/json'
        },
        'body': body
      };
      // perform http fetch
      fetch('/api/logout', options).then((response) => {
        if(response.ok) {
          this.setState({loggedin: false});
          const auth2 = window.gapi.auth2.getAuthInstance();
          auth2.signOut().then(()=> {
            // set the state for signedIn to be false and remove the username
            this.setState({signedIn: false, usersname: ''});
            alert('you have been logged out');
            // console.log('signed out');
          });
        }
      });
    }
  }

  // change the class of the google sign-in button so that the image can change
  // attempt to conform to the google use definition
  signInMouseDown(e) {
    e.preventDefault();
    e.target.className = 'google-signin-clicked';
  }

  // change the class of the google sign-in button so that the image can change
  // attempt to conform to the google use definition
  signInMouseUp(e) {
    e.preventDefault();
    e.target.className = 'google-signin';
  }

  render() {

    let User;
    // if the user is signed in show them that they are by displaying their name and a logout option
    if(this.state.signedIn) {
      User = (params) => (
        <div>
          <h3 style={{display: 'inline', padding: '5px 10px'}}>Welcome {params.usersname}</h3>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <a onClick={this.signOut}>Logout</a>
        </div>
      );
    } else { // otherwise present the button to signin with google
      User = (params) => (
        <div id='signin-google' className={(this.state.signedIn)?'google-signin-signedin':'google-signin'} onClick={this.signIn} onMouseDown={this.signInMouseDown} onMouseUp={this.signInMouseUp}>
        </div>
      );
    }

    return (
      <div style={{width:'80%', margin:'auto'}}>

        <h1 style={{textAlign: 'center'}}>{`${this.state.date} ${this.state.title}`}</h1>

        <div id='usersname'>
          <User usersname={this.state.usersname} />
        </div>

        <hr />

        <Viewer date={this.state.date}
          handleNext={this.handleNext}
          handlePrevious={this.handlePrevious}
          handleTitle={this.handleTitle} />

        <br/>
        <br/>

        <Picker page={this.state.key} handleKey={this.handleKey} />

        <div>
          <p>Created by Devon Rimmington</p>
          <hr />
          <p>Images and Videos may be subject to copyright</p>
        </div>
      </div>
    );
  }
}
