import React from 'react';
import { Link } from 'react-router-dom';
import { Col, Row } from 'react-bootstrap';


export default class Viewer extends React.Component {

  constructor(props) {
    super(props);
    this.state = ({date: props.date, title: '', uri:'',  hduri: '', explaination: '',
      copyright: '', media_type: '', loading: true});
    this.loadData = this.loadData.bind(this);
    // console.log('viewer ' + props.date);
  }

  componentDidUpdate(prevProps) {
    // if the date changes scroll the user to the top b/c the view is at the top and the picker is at the bottom
    // if the date is new then load a new image
    if(this.props.date !== prevProps.date) {
      this.loadData();
      window.scrollTo(0, 0);
    }
  }

  componentDidMount() {
    this.loadData();
  }

  // change the title
  // the title can be found in the 'main' component and requires a handler when the title is changed here to change it there
  titleHandler(title) {
    this.props.handleTitle(title);
  }

  // load the data
  loadData() {

    this.setState({loading: true});

    // setup the options for the http request
    let options = {
      method: 'GET',
      mode: 'same-origin',
      cache: 'default',
      headers:{
        'Content-Type': 'application/json',
      }
    };

    fetch(`/api/apod/${this.props.date}`, options).then((response) => {
      if(response.ok){
        return response.json();
      }
      else {
        throw response;
      }
    }).then((response) => {
      this.setState({date: response.date, copyright: response.copyright,
          explanation: response.explanation, uri: response.url, hduri:response.hdurl,
          title: response.title, media_type: response.media_type, loading: false});
          // handle the title change for 'main'
      this.titleHandler(response.title);
    }).catch((error) => {
      console.error(error);
    });
  }

  render() {
    // if the state is set to loading (http is still recieving data) than indicate this to the user with a loading wheel
    if(this.state.loading) {
      return (<div className='loader'></div>);
    }else {
      return (
        <ImageContainer title={this.state.title} handleNext={this.props.handleNext} handlePrevious={this.props.handlePrevious} explanation={this.state.explanation} copyright={this.state.copyright}>
          <Image date={this.state.date} uri={this.state.uri} title={this.state.title} />
        </ImageContainer>
      );
    }
  }
}

// stateless component that holds the image and the other details
// also allows the user to select new images by increasing and decreasing the date
function ImageContainer(props) {

  // reloads the data and moves the date up one day
  // action is handled in the 'viewer' component
  const NextHandler = () => {
    props.handleNext();
  };

  // reloads the data and moves the date back one day
  // action is handled in the 'viewer' component
  const PreviousHandler = () => {
    props.handlePrevious();
  };

  return (
    <div>

      <div id='_top' style={{width:'80%', margin:'auto'}}>
        <div className='viewerImage'>{props.children}</div>
        <a className='viewerLink left' onClick={PreviousHandler}><h2>Previous</h2></a>
        <a className='viewerLink right' onClick={NextHandler}><h2>Next</h2></a>
      </div>

      <br/>
      <br/>
      <br/>
      <br/>

      <div className='panel-group'>
        <div className='panel panel-default'>

          <div className='panel-heading'>
            <h3 className='panel-title'>
              <a data-toggle='collapse' href='#explaination'>Description</a>
            </h3>
          </div>

          <div id='explaination' className='collapse in' style={{padding: 15}}>
            <h4>{props.title}</h4>
            <h5>{props.copyright}</h5>
            {props.explanation}
          </div>

        </div>
      </div>

    </div>
  );
}

// stateless component that holds the image itself and links to it's HD version
function Image(props) {

  // link to hd route by changing the url
  return (
    <Link to={`/apod/hd/${props.date}`}>
    <img alt={props.title} src={props.uri} style={{display:'block', margin:'0 auto', width:'80%'}}/>
    </Link>
  );
}
