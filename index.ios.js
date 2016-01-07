/**
 * RTMuni: Real-Time Muni
 * Non-customizable code: for commuting between Castro and Montgomery stations in San Francisco
 */
'use strict';

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
} = React;

var  castroInKTLM,
  churchInKTLM,
  churchInJ,
  churchInN,
  montgOut,
  church37In,
  church37Out,
  castro37Out,
  castro33In,
  fetchTime;

// 511.org :: XML response
// var token = '5129621e-3645-4ed7-9579-1f25fd65bf66';
// var apiBase = 'http://services.my511.org/Transit2.0/GetNextDeparturesByStopCode.aspx?token=' + token + '&stopcode=';

// restbus.info :: endpoint query with JSON response
var apiUrl = // set up server and provide endpoint here

var RTMuni = React.createClass({

  getInitialState: function() {
    return {
      castroInKTLM: null,
      churchInKTLM: null,
      churchInJ: null,
      churchInN: null,
      montgOut: null,
      church37In: null,
      church37Out: null,
      castro37Out: null,
      castro33In: null,
      fetchTime: null,
    };
  },

  componentDidMount: function() {
    this.fetchData();
  },

  collectResponses: function(data) {
    var respObj = {
      '5728': [],
      '5726': [],
      '4006': [],
      '4448': [],
      '6994': [[],[],[],[],[]], // maps to order in array montg (below)
      '7073': [],
      '5667': [],
      '3325': [],
      '3255': []
    };
    var montg = ['J','KT','L','M','N'];
    for (var i=0; i < data.length; i++) {
      if (data[i].stop.id === '6994') {
        var routeIdx = montg.indexOf(data[i].route.id);
        for (var j=0; j < data[i].values.length; j++){
          respObj[data[i].stop.id][routeIdx].push(data[i].values[j].minutes);
        }
      } else {
        for (var k=0; k < data[i].values.length; k++) {
          respObj[data[i].stop.id].push(data[i].values[k].minutes);
        }
      }
    }
    var currentDate = new Date();
    var minutes = currentDate.getMinutes() < 10 ? '0' + currentDate.getMinutes() : currentDate.getMinutes();
    var seconds = currentDate.getSeconds() < 10 ? '0' + currentDate.getSeconds() : currentDate.getSeconds();
    var currentTime = 'Last fetch: ' + currentDate.getHours() + ':' + minutes + ':' + seconds;
    respObj.fetchTime = currentTime;
    return respObj;
  },

  sortArr: function(arr) {
    return arr.sort(function(a,b) {
      return a - b;
    });
  },

  sortPredictions: function(obj) {
    for (var i in obj) {
      if (i === '6994') {
        var tempArr = [];
        var montg = ['J','KT','L','M','N'];
        for (var j=0; j < obj[i].length; j++) {
          var temp6994 = this.sortArr(obj[i][j]).join();
          tempArr.push(montg[j] + ': ' + temp6994);
        }
        if (tempArr.length > 5) {
          tempArr = tempArr.slice(0,5);
        }
        obj[i] = tempArr.join('\n');
      } else if (i === 'fetchTime') {
        // do nothing
      } else {
        var temp = this.sortArr(obj[i]);
        if (temp.length > 5) {
          temp = temp.slice(0,5);
        }
        obj[i] = temp.join();
      }
    }
    return obj;
  },

  fetchData: function() {
    fetch(apiUrl)
      .then((response) => response.json())
      .then((responseData) => {
        return this.collectResponses(responseData);
      })
      .then((responseObject) => {
        return this.sortPredictions(responseObject);
      })
      .then((predictionsObj) => {
        this.setState({
          castroInKTLM: predictionsObj['5728'],
          churchInKTLM: predictionsObj['5726'],
          churchInJ: predictionsObj['4006'],
          churchInN: predictionsObj['4448'],
          montgOut: predictionsObj['6994'],
          church37In: predictionsObj['7073'],
          church37Out: predictionsObj['5667'],
          castro37Out: predictionsObj['3325'],
          castro33In: predictionsObj['3255'],
          fetchTime: predictionsObj['fetchTime'],
        });
      })
      .done();
  },

  render: function() {
    if (!this.state.fetchTime) {
      return this.renderLoading();
    }
    var preds = {};
    preds.castroInKTLM = this.state.castroInKTLM;
    preds.churchInKTLM = this.state.churchInKTLM;
    preds.churchInJ = this.state.churchInJ;
    preds.churchInN = this.state.churchInN;
    preds.montgOut = this.state.montgOut;
    preds.church37In = this.state.church37In;
    preds.church37Out = this.state.church37Out;
    preds.castro37Out = this.state.castro37Out;
    preds.castro33In = this.state.castro33In;
    preds.fetchTime = this.state.fetchTime;
    return this.renderPredictions(preds);
  },

  renderLoading: function() {
    return (
      <View style={styles.container}>
        <Text>
          Fetching predictions...
        </Text>
      </View>
      );
  },

  renderPredictions: function(predictions) {
    return (
      <View style={styles.container}>
        <Text style={styles.main}>
          Inbound :: Headed Downtown
        </Text>
        <Text style={styles.header}>
          Castro Station
        </Text>
        <Text style={styles.route}>
          {predictions.castroInKTLM}
        </Text>
        <Text style={styles.header}>
          Church Station & Stops
        </Text>
        <Text style={styles.route}>
          KT-L-M: {predictions.churchInKTLM}
        </Text>
        <Text style={styles.route}>
          J at Church/Duboce: {predictions.churchInJ}
        </Text>
        <Text style={styles.route}>
          N at Duboce/Church: {predictions.churchInN}
        </Text>
        <Text style={styles.main}>
          Outbound :: Headed Home
        </Text>
        <Text style={styles.header}>
          Montgomery Station
        </Text>
        <Text style={styles.route}>
          {predictions.montgOut}
        </Text>
        <Text style={styles.header}>
          Church Stops
        </Text>
        <Text style={styles.route}>
          37 uphill: {predictions.church37In}
        </Text>
        <Text style={styles.route}>
          37 along Market: {predictions.church37Out}
        </Text>
        <Text style={styles.header}>
          Castro Stops
        </Text>
        <Text style={styles.route}>
          33 at 18th/Castro: {predictions.castro33In}
        </Text>
        <Text style={styles.route}>
          37 at Market/Castro: {predictions.castro37Out}
        </Text>
        <Text style={styles.timestamp}>
          {predictions.fetchTime}
        </Text>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: '#F5FCFF',
  },
  timestamp: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '400',
    textAlign: 'right',
    backgroundColor: '#333333',
    marginTop: 15,
  },
  main: {
    fontSize: 24,
    color: '#000000',
    fontWeight: '900',
    textAlign: 'left',
    // backgroundColor: '#CCCCFF',
  },
  header: {
    fontSize: 24,
    color: '#999999',
    fontWeight: '800',
    textAlign: 'left',
    margin: 10,
  },
  route: {
    fontSize: 20,
    textAlign: 'left',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('RTMuni', () => RTMuni);
