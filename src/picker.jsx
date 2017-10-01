import React from 'react';
import { Row, Col, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ContainerQuery } from 'react-container-query';

const lastDate = new Date('1995-07-20');
const itemsPerPage = 15;
const msPerDay = 1000*60*60*24;

/*
const tableSize = {
  'width-between-400-and-599': {
    minWidth: 400,
    maxWidth: 599,
    fontSize:10
  },
  'width-between-600-and-799': {
    minWidth: 600,
    maxWidth: 799,
    fontSize: 11
  },
  'width-larger-than-800': {
    minWidth: 600,
    fontSize: 12
  }
};
*/

export default class Picker extends React.Component {

  constructor(props) {
    super(props);
    this.state = ({numberOfPages: 0, list:[], date: new Date(), loading: true});
    this.loadData = this.loadData.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.getNumberOfPages = this.getNumberOfPages.bind(this);
  }

  componentDidMount() {
    this.getNumberOfPages();
    this.loadData(this.props.page);
  }

  componentDidUpdate(prevProps) {
    // if the props change (ie: the page number) than reload the data
    if(prevProps.page !== this.props.page) {
      console.log('new props' + this.props.page);
      this.loadData(this.props.page);
    }
  }

  // gets the number of pages needed to display all of the items
  getNumberOfPages() {
    let today = new Date();
    let timeDiff = today.getTime() - lastDate.getTime();
    let numberOfDays = Math.ceil(timeDiff / msPerDay);
    console.log(numberOfDays);
    let numberOfPages = Math.ceil(numberOfDays/itemsPerPage);
    this.setState({numberOfPages: numberOfPages});
  }

  handleSelect(key) {
    this.props.handleKey(key);
  }

  // allows a signed in user to vote on weather or not they like an image
  handleRating(e) {

    e.preventDefault();
    const id = e.target.id;
    // set the body and header options for the http request
    let body = {
      date: id
    };
    let options = {
      method: 'POST',
      credentials: 'include',
      mode: 'same-origin',
      cache: 'default',
      headers: {
        'Content-Type':'application/json'
      },
      body:JSON.stringify(body)
    };



    fetch('/api/apod/vote', options).then(response => {
      if(response.ok) {
        if(response.status === 200) {
          alert('thank you for you vote');
          document.getElementById(id).innerHTML = Number(document.getElementById(id).innerHTML) + 1;
        } else if(response.status === 201) {
          alert('your vote has been updated');
          document.getElementById(id).innerHTML = Number(document.getElementById(id).innerHTML) - 1;
        }
      } else if(response.status === 401) {
          alert('please signin through google to vote');
      } else if(response.status === 500) {
          alert('error in processing your vote :(\nplease try again later)');
      } else {
          throw response;
      }
    }).catch((error) => {
      console.error(error);
    });
  }

  // load a list of apod items from the server
  loadData(key) {

    // tell the UI that the website is loading data
    this.setState({loading: true});

    // set the date from which to start
    // this date is based off the page number of the table
    let time = new Date().getTime() - (key-1)*itemsPerPage*msPerDay - (msPerDay/6); // the (msPerDay/6) is 4 hours which will push my timezone (ATL (-4) to GMT (0)) which is important because thats the time zone for the APOD api
    // todo change this ^^^ to work for every timezone
    let date = new Date(time);

    // prepare the string for being used in the api call
    date = date.toISOString().replace(/\T([0-9]{2,3}:)*[0-9]*.[0-9]{2,3}Z/, '');

    // prepare the options for the http request
    let options = {
      method: 'GET',
      credentials: 'include',
      mode: 'same-origin',
      cache: 'default',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    fetch('/api/apod/'+date+'/'+itemsPerPage, options).then((response) => {
      if(response.ok) {
        return response.json();
      }else {
        throw response;
      }
    }).then((response) => {
      // set the list state as the data array response from the server
      this.setState({list:response.data, loading:false});
    }).catch((error) => {
      console.error(error);
    });
  }

  render() {

    // map the items from the http request to table items
    const tableBody = this.state.list.map((item) => (
      <tr key={item.date}>
        <td><Link to={`/apod/${item.date}`}>{item.date}</Link></td>
        <td>{item.title}</td>
        <td>{item.copyright}</td>
        <td>{item.media_type.charAt(0).toUpperCase() + item.media_type.slice(1)}</td>
        <td style={{textAlign:'right'}}><a id={item.date} onClick={this.handleRating}>{item.votes || 0}</a></td>
      </tr>
    ));

    // is the data is loading show the loading icon
    if(this.state.loading) {
      return (<div className='loader'></div>);
    }else { // otherwise show the table and the page options
      return (
        <div>
        <table className='table table-hover'>
          <thead>
            <tr>
              <th>Date</th>
              <th>Title</th>
              <th>Copywrite</th>
              <th>Format</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {tableBody}
          </tbody>
        </table>
        <br />
        <Pagination first last next prev ellipsis items={this.state.numberOfPages} maxButtons={3} activePage={Number(this.props.page) ? Number(this.props.page) : 1} onSelect={this.handleSelect}/>
        </div>
      );
    }
  }
}
