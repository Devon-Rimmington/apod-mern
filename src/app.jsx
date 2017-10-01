import React from 'react';
import ReactDOM from 'react-dom';
import APOD from './APOD.jsx';

// find the container and render the APOD component within the container
const container = document.getElementById('app');
ReactDOM.render(<APOD />, container);
