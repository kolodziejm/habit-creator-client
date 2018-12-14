import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import jwtDecode from 'jwt-decode';
import axios from '../config/axios';
import { setHabits, finishHabit } from '../actions/habitActions';
import { logoutUser } from '../actions/authActions';

import theme from '../theme';

import { Line } from 'rc-progress';
import Navbar from '../components/Navbar';
import FinishHabitItem from '../components/FinishHabitItem';
import { Typography, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, CircularProgress, Snackbar } from '@material-ui/core';

const styles = {
  list: {
    listStyleType: 'none',
    margin: '0 auto',
    padding: '0 8px 0 8px',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '900px'
  },
  progressWrapper: {
    maxWidth: '900px',
    padding: '0 8px 0 8px',
    margin: '0 auto 64px auto'
  },
  loadingWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrapper: {
    margin: '16px 0 8px 0'
  },
  info: {
    backgroundColor: theme.palette.info.backgroundColor,
    color: theme.palette.info.color
  }
};

class Dashboard extends Component {

  state = {
    finishSnackbarOpen: false,
    finishDialogOpen: false,
    habitId: ''
  }

  componentDidMount() {
    const token = jwtDecode(localStorage.jwtToken);
    if (token.exp < Date.now() / 1000) {
      this.props.logoutUser();
    }
    axios.get('/habits')
      .then(res => {
        this.props.setHabits(res.data);
      })
      .catch(err => this.setState({ errors: err }))
  }

  finishHabit = e => {
    const { habitId } = this.state;
    axios.patch(`/habits/finish/${habitId}`)
      .then(res => {
        this.props.finishHabit(habitId);
        this.closeFinishDialogHandler();
        this.openFinishSnackbar();
      })
      .catch(err => {
        console.log(err);
      })
  }

  openFinishDialogHandler = habitId => {
    this.setState({
      finishDialogOpen: true,
      habitId
    })
  }

  closeFinishDialogHandler = () => {
    this.setState({
      finishDialogOpen: false,
      habitId: ''
    })
  }

  openFinishSnackbar = () => this.setState({ finishSnackbarOpen: true })

  closeFinishSnackbar = () => this.setState({ finishSnackbarOpen: false })

  render() {
    const { classes } = this.props;

    const habitList = this.props.habits.habits.map((habit, index) => (
      <FinishHabitItem
        key={habit._id}
        name={habit.name}
        isFinished={habit.isFinished}
        clicked={() => this.openFinishDialogHandler(habit._id)} />
    ));

    const finishedHabits = this.props.habits.habits.filter(habit => habit.isFinished).length;
    const completedPercent = ((finishedHabits / this.props.habits.habits.length) * 100).toFixed(0);

    return (
      <>
        <Navbar navValue={0} />
        <main>
          <div className={classes.titleWrapper}>
            <Typography variant="h4" align="center">Today's progress</Typography>
            <Typography variant="h5" align="center">
              {completedPercent !== 'NaN' ? <span>{completedPercent}%</span> : <span>&nbsp;</span>}
            </Typography>
          </div>
          <div className={classes.progressWrapper}>
            <Line
              percent={completedPercent ? completedPercent : 0}
              strokeWidth="2"
              trailWidth="2"
              strokeColor={theme.palette.secondary.main} />
          </div>
          <ul className={classes.list}>
            {this.props.habits.loading ?
              <div className={classes.loadingWrapper}>
                <CircularProgress style={{ width: 60, height: 60 }} />
              </div>
              : habitList}
          </ul>
          <Dialog
            open={this.state.finishDialogOpen}
            onClose={this.closeFinishDialogHandler}
          >
            <DialogTitle>Reminder</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Did you really finish that habit? Remember - cheating won't get you anywhere!
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                color="secondary"
                variant="contained"
                size="medium"
                onClick={this.finishHabit}
              >
                Finish
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            ContentProps={{
              classes: {
                root: classes.info
              }
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            open={this.state.finishSnackbarOpen}
            autoHideDuration={5000}
            onClose={this.closeFinishSnackbar}
            message="Well done!"
          />
        </main>
      </>
    )
  }
}

const mapStateToProps = state => ({
  habits: state.habit
});

export default connect(mapStateToProps, { logoutUser, setHabits, finishHabit })(withRouter(withStyles(styles)(Dashboard)));