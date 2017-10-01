import React from 'react';

const ImageDisplayer = (props) => (
  <div>
    <h2>{props.data.date} {props.data.title}</h2>
    <hr />
    <img alt='todays image' src={props.data.url} />
    <hr />
    <div>
      <p>{props.data.desc}</p>
    </div>
  </div>
)

export default class Selector extends React.Component{

  constructor(props){
    super(props);
    this.state = {data: {url:'', title:'', desc:'', date:''}};
    this.loadData = this.loadData.bind(this);
  }

  componentDidMount(){
    this.loadData();
  }

  componentDidUpdate(nextProps){
    if(!(this.props.match.params === nextProps.match.params)){
      this.loadData();
    }
  }



  // load todays image from APOD and display it
  loadData(){
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('mode', 'cors');
    headers.append('cache', 'default');

    let req;



    // get todays
    if(this.props.match.params.item_id === 'today'){
      req = 'https://api.nasa.gov/planetary/apod?api_key=nCOFtfQQFN1qWu5dHiLN7lTZDLrxbMsCoAGvb3zs';
    }else{ // get the selected date
      req = 'https://api.nasa.gov/planetary/apod?api_key=nCOFtfQQFN1qWu5dHiLN7lTZDLrxbMsCoAGvb3zs&date='+ this.props.match.params.item_id;
    }

    console.log(this.props.match.params.item_id);

    fetch(req, headers).then(res => res.json()).then((res) => {
      //if the response is successful
      if(res.status >= 200 && res.status < 300){
        throw res;
      }
      else {
        return res;
      }
    }).then((res) => {
      this.setState({data: {
        url: res.url, desc: res.explanation, date: res.date, title: res.title
      }});
    }).catch((err) => {
      console.log(err);
    });
  }

  render(){
    return (<ImageDisplayer data={this.state.data} />);
  }

}
