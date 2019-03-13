import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class App extends Component {
  state = {
    value: '',
    totalIssues: 0,
    issuesArray: [],
    last24hrsIssueCount: 0,
    last7daysCount: 0,
    before7daysCount: 0,
    loading: false
  };
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value }); // get data from textfield
  }

  handleSubmit(event) {
    this.getData(this.state.value); //pass data to function that handles data from api
    event.preventDefault();
  }

  getData(data) {
    this.setState({ loading: true })
    let self = this;
    let repoData = data.split('/');
    let owner = repoData[3];
    let repo = repoData[4];
    let totalOpenIssues;
    let dataArray = [];
    axios.get(`https://api.github.com/repos/${owner}/${repo}`)    // calling th git api
      .then(async function (res) {
        totalOpenIssues = res.data.open_issues_count;
        self.setState({ totalIssues: totalOpenIssues })     // saving to state for display data
        let count = totalOpenIssues / 100;                   // as github api handles max 100 records per page so                                                      we calculate the number of iterations.
        count = Math.ceil(count);
        for (let i = 1; i <= count; i++) {
          let adata = await self.getDatafromApi(i, owner, repo);  // getting data from api and store it to a Array.
          dataArray = dataArray.concat(adata.data);
        }
        self.setState({ issuesArray: dataArray })
        self.logicFunction(self.state.issuesArray);   // pass data to get previsious filter based data.
      })
      .catch(function (error) {
        self.setState({ loading: false })  // error handling
        toast.error("Error occured check your url repository may be private!", {
          position: toast.POSITION.TOP_RIGHT
        });
        console.log(error);
      });
  }

  logicFunction(issueArray) {
    let today = new Date();
    let todayTime = Date.now();
    let prev24time = today.setHours(today.getHours() - 24);  // get last 24 hrs timestamp
    let prev7daytime = today.setDate(today.getDate() - 7)    // get last 7 day date and time
    let count24 = 0;
    let countlast7 = 0;                         // counts init
    let countbefore7days = 0;
    issueArray.forEach((el) => {
      let matchDate = new Date(el.created_at).getTime();    //  here we convert fetched issue date to a date  matchable time stamp
      if (matchDate >= prev24time && matchDate < todayTime) {    // comparing the data based conditions.
        count24 += 1;
      }
      else if (matchDate >= prev7daytime && matchDate < prev24time) {
        countlast7 += 1;
      }
      else if (matchDate <= prev7daytime) {
        countbefore7days += 1;
      }
    });
    this.setState({ last24hrsIssueCount: count24 })
    this.setState({ last7daysCount: countlast7 })   //  saving all data to react state
    this.setState({ before7daysCount: countbefore7days })
    this.setState({ loading: false })
  }

  getDatafromApi(i, owner, repo) {
    return new Promise((resolve, reject) => {
      axios.get(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&page=${i}&per_page=100`)
        .then(function (response) {
          resolve({ data: response.data })
        }).then((err) => {
          reject({ data: err })
        })
    })
  }

  render() {
    return (
      <div className="col-md-6 col-md-offset-3">
        <ToastContainer autoClose={8000} />
        <h2>Github Open Issues Finder</h2>
        <br />
        <form onSubmit={this.handleSubmit}>
          <div className='form-group'>
            <label htmlFor="username">Enter any public repository link</label>
            <input type="text" className="form-control" onChange={this.handleChange} />
          </div>
          <div className="form-group">
            <button className="btn btn-primary">Submit</button>
          </div>
        </form>
        {this.state.loading && <div className="custom-overlay sidebar-overlay active"></div>}
        {this.state.loading && <div className="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>}

        <table className="table table-striped table-bordered">
          <thead className="thead-dark">
            <tr>
              <th scope="col">Total Open Issues</th>
              <th scope="col">Issues opened in last 24 hrs</th>
              <th scope="col">Issues opened before 24 hrs till last 7 days.</th>
              <th scope="col">Issues opened before 7 days.</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">{this.state.totalIssues}</th>
              <td>{this.state.loading ? 'loading' : this.state.last24hrsIssueCount}</td>
              <td>{this.state.loading ? 'loading' : this.state.last7daysCount}</td>
              <td>{this.state.loading ? 'loading' : this.state.before7daysCount}</td>
            </tr>
          </tbody>
        </table>
      <div>
      </div>
      <label className="me">created by Shubham Latiyan</label>
      </div>
    );
  }
}
export default App;