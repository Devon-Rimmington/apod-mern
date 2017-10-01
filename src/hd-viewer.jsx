import React from 'react';

const style = {
  margin: '0',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)'
};

let left = 0, top = 0;
let leftBegin, topBegin;

let zoomStyle = {
  position: 'absolute',
  maxHeight: '10000px',
  top: 0,
  left: 0
};

// todo make a draggable component and add an image as a child
// todo fix bug on initial cursor move on the drag (the image jumps as the drag begins and I don't know why???)

export default class HDViewer extends React.Component {

  // expecting the date or the hduri to be passed in as a prop
  constructor(props) {
    super(props);
    this.state = ({hduri:'', zoom: false, imageStyle:style, drag: false, loading: true});
    this.handleImageZoom = this.handleImageZoom.bind(this);
    /*
    this.handleImageDrag = this.handleImageDrag.bind(this);
    this.handleImageDragBegin = this.handleImageDragBegin.bind(this);
    this.handleImageDragEnd = this.handleImageDragEnd.bind(this);
    */
    this.loadData = this.loadData.bind(this);
  }

  componentDidMount() {
    // initialize/update the cursor to inducate to the user that they can zoom in
    this.loadData();
    document.body.style.cursor = 'zoom-in';
    document.body.style = 'background-color:black';
  }

  // turn the cursor back to normal
  componentWillUnmount() {
    document.body.style.cursor = 'default';
    document.body.style = 'background-color:white';
  }

  // load the hd version of the image
  loadData() {

    this.setState({loading: true});

    let options = {
      method: 'GET',
      mode: 'same-origin',
      cache: 'default',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    fetch(`/api/apod/${this.props.match.params.date}`, options).then((response) => {
      if(response.ok) {
        return response.json();
      }else {
        throw 'Error ' + response;
      }
    }).then((response) => {
      this.setState({hduri: response.hdurl, loading: false});
    }).catch((error) => {
      console.error(error);
    });
  }

  handleImageZoom(e) {
    console.log((this.state));
    if(!this.state.drag) {
      if(!this.state.zoom) {
        this.setState({imageStyle: zoomStyle});
        this.setState({zoom: true});
        // reset the postion of the image
        zoomStyle['left'] = 0;
        zoomStyle['top'] = 0;
        // update the cursor
        document.body.style.cursor = 'zoom-out';
      }else {
        this.setState({imageStyle: style});
        this.setState({zoom: false});
        //update the cursor
        document.body.style.cursor = 'zoom-in';
        // reset the position of the image in the zoom mode for the next time the user zooms
        style['left'] = '50%';
        style['top'] = '50%';
      }
    }
  }

  // todo create a new attempt or fix bug
  // attempt to allow the user to drag around a zoomed in image instead of having to scroll but this was too buggy to keep
  /*
  handleImageDrag(e) {
    console.log(e);
    if(this.state.drag){

      // set the change in position of the image as the cursor moves while dragging
      let deltaLeft = leftBegin - e.clientX;
      let deltaTop = topBegin - e.clientY;

      // updates the position the image should now be @ by using the delta value from above
      zoomStyle['left'] = zoomStyle['left'] - deltaLeft;
      zoomStyle['top'] = zoomStyle['top'] - deltaTop;

      // updates the style
      this.setState({imageStyle: zoomStyle});

      // reset the initial position
      // this anchors the drag pivot around the last place the new position was used to calculate
      leftBegin = e.clientX;
      topBegin = e.clientY;
    }
  }

  handleImageDragBegin(e) {
    // set the state of drag to be true
    this.setState({drag: true});
    // set the initial pivot for the drag
    leftBegin = e.clientX;
    topBegin = e.clientY;
    console.log('drag started');
    // update the cursor
    document.body.style.cursor = 'move';
  }

  handleImageDragEnd(e) {
    // set the state of drag to be false
    this.setState({drag: false});

    // now that the drag is over ensure that the position is correctly set
    // set the change in position
    let deltaLeft = leftBegin - e.clientX;
    let deltaTop = topBegin - e.clientY;

    // alter the zoom style by moving the position by the change in position
    zoomStyle['left'] = zoomStyle['left'] - deltaLeft;
    zoomStyle['top'] = zoomStyle['top'] - deltaTop;

    // update the style
    this.setState({imageStyle: zoomStyle});
    // update the cursor
    document.body.style.cursor = 'zoom-out';
  }
  */

  render() {
    // if the state is set to loading (http is still recieving data) than indicate this to the user with a loading wheel
    if(this.state.loading) {
      return (<div className='loader'></div>);
    }else {
      return (
          <div>
            <img className='hdViewerImage' onClick={this.handleImageZoom} alt='image' src={this.state.hduri} style={this.state.imageStyle} />
          </div>
      );
    }
  }

}
