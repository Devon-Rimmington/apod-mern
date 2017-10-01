import React from 'react';
import {BrowserRouter as Router, Route, Link} from 'react-router-dom';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import { Pagination } from 'react-bootstrap';

require ('../node_modules/react-bootstrap-table/dist/react-bootstrap-table-all.min.css');

const Data = (title, date, format, likes, download) => {
  return {title:title, date:date, format:format, likes:likes, download:download};
}

export default class List extends React.Component{

  constructor(props){
    super(props);
    this.state = {offset: 1, data:[{
      title: '', date: '', format: '', likes: 0, download: ''
    }]};
    this.loadData  = this.loadData.bind(this);
  }

  componentDidMount(){
    this.loadData();
  }

  loadData(){
    /*
    let date = new Date();
    let data = this.state.data;
    data.push(Data('test', date.toISOString().replace(/\T([0-9]{2,3}:)*[0-9]*.[0-9]{2,3}Z/, ''), 'test', 0, 'download1'));
    // count down through the dates to generate 1000 dates
    for(let i = 0 + this.state.offset; i < 100; i++){
      date.setDate(date.getDate() - 1);
      data.push(Data('test', date.toISOString().replace(/\T([0-9]{2,3}:)*[0-9]*.[0-9]{2,3}Z/, ''), 'image', 0, 'download'));
    }
    let prevData = this.state.data;
    prevData.data = data;
    */

    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('cache', 'default');

    fetch('http://localhost:3000/api/apod', headers).then((res) => {
      if(!res.ok){throw res;}
      else{return res.json();}
    }).then((res) => {
      this.setState({data:res.data});
      console.log(this.state.data[1].date);
    }).catch((err) => {
      console.log(JSON.stringify(err));
    });
  }

  next(e){
    console.log(e);
  }

  /*<Link to={`/apod/${new Date(data.date).toISOString().replace(/\T([0-9]{2,3}:)*[0-9]*.[0-9]{2,3}Z/, '')}`}>
    {new Date(data.date).toDateString()}</Link>*/

  render(){


    const datas = this.state.data.map((data) =>
      (
        <li key={data.likes}>
        <Link to={`/apod/${data.date}`}>
          {new Date(data.date).toDateString()}</Link>
        </li>
      )
    );

    return (
      <div>
      <ul>{datas}</ul>
      <Pagination items={6/2} activePage={1} onSelect={this.next} maxButtons={7} next prev boundryLinks />
      </div>
    );
  }
}
