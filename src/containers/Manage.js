import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from '../config/axios';
import { withStyles } from '@material-ui/core/styles';
import { Menu, MenuItem, Button, Dialog, DialogContent, DialogContentText, TextField, DialogActions, DialogTitle, Snackbar, Typography, CircularProgress } from '@material-ui/core';
import { Add } from '@material-ui/icons';
import theme from '../theme';

import { setHabits, addHabit, deleteHabit, editHabit } from '../actions/habitActions';
import { logoutUser } from '../actions/authActions';

import Navbar from '../components/Navbar';
import EditHabitItem from '../components/EditHabitItem';

import jwtDecode from 'jwt-decode';

const styles = {
  list: {
    listStyleType: 'none',
    margin: '0 auto',
    padding: '0 8px 0 8px',
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '900px'
  },
  loadingWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64
  },
  addBtnContainer: {
    display: 'flex',
    justifyContent: 'center',
    margin: '32px 0 32px 0'
  },
  addSnackbar: {
    backgroundColor: theme.palette.info.backgroundColor,
    color: theme.palette.info.color,
    padding: '8px 16px',
  },
  errorSnackbar: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    padding: '8px 16px',
  },
  danger: {
    backgroundColor: theme.palette.danger.backgroundColor,
    color: theme.palette.danger.color,
    padding: '8px 16px',
  }
};

class Manage extends Component {

  state = {
    errors: {},
    errorSnackbarOpen: false,
    isMenuOpen: false,
    anchorEl: null,
    habitId: '',
    editHabitName: '',
    name: '',
    addDialogOpen: false,
    addSnackbarOpen: false,
    editDialogOpen: false,
    editSnackbarOpen: false,
    deleteDialogOpen: false,
    deleteSnackbarOpen: false,
  }

  componentDidMount() {
    const token = jwtDecode(localStorage.jwtToken);
    if (token.exp < Date.now() / 1000) return this.props.logoutUser(this.props.history, true);

    axios.get('/habits')
      .then(res => this.props.setHabits(res.data))
      .catch(err => this.setState({ errors: err }))
  }

  inputChangedHandler = e => this.setState({ [e.target.name]: e.target.value });

  openMenu = (e, habitId, editHabitName) => {
    const token = jwtDecode(localStorage.jwtToken);
    if (token.exp < Date.now() / 1000) return this.props.logoutUser(this.props.history, true);
    this.setState({
      isMenuOpen: true,
      anchorEl: e.currentTarget,
      habitId,
      editHabitName
    })
  }

  closeMenu = e => {
    this.setState({
      isMenuOpen: false,
      anchorEl: null,
      habitId: '',
      editHabitName: ''
    });
  }

  openAddDialog = e => {
    const token = jwtDecode(localStorage.jwtToken);
    if (token.exp < Date.now() / 1000) return this.props.logoutUser(this.props.history, true);
    if (this.props.habits.habits.length >= 10) return this.openErrorSnackbar();
    this.setState({
      addDialogOpen: true,
      name: '',
      errors: {}
    })
  }

  closeAddDialog = e => this.setState({ addDialogOpen: false })

  openEditDialog = e => {
    this.setState({
      editDialogOpen: true,
      isMenuOpen: false,
      anchorEl: null,
    })
  }

  closeEditDialog = e => {
    this.setState({ editDialogOpen: false })
    this.closeMenu(e);
  }

  openDeleteDialog = e => {
    this.setState({
      deleteDialogOpen: true,
      isMenuOpen: false,
      anchorEl: null,
    })
  }

  closeDeleteDialog = e => {
    this.setState({ deleteDialogOpen: false })
    this.closeMenu(e);
  }

  openAddSnackbar = () => this.setState({ addSnackbarOpen: true });

  closeAddAndEditSnackbar = () => this.setState({ addSnackbarOpen: false, editSnackbarOpen: false });

  openErrorSnackbar = () => this.setState({ errorSnackbarOpen: true });

  closeErrorSnackbar = () => this.setState({ errorSnackbarOpen: false });

  openEditSnackbar = () => this.setState({ editSnackbarOpen: true });

  openDeleteSnackbar = () => this.setState({ deleteSnackbarOpen: true });

  closeDeleteSnackbar = () => this.setState({ deleteSnackbarOpen: false });

  addNewHabit = e => {
    e.preventDefault();
    const token = jwtDecode(localStorage.jwtToken);
    if (token.exp < Date.now() / 1000) return this.props.logoutUser(this.props.history, true);
    const { name } = this.state;
    const habitData = { name };
    axios.post('/habits', habitData)
      .then(res => {
        this.props.addHabit(res.data);
        this.closeAddDialog();
        this.openAddSnackbar();
      })
      .catch(err => console.log(err));
  }

  editHabit = e => {
    e.preventDefault();
    const token = jwtDecode(localStorage.jwtToken);
    if (token.exp < Date.now() / 1000) return this.props.logoutUser(this.props.history, true);
    const { editHabitName, habitId } = this.state;
    const habitData = { editHabitName };
    axios.patch(`/habits/${habitId}`, habitData)
      .then(res => {
        this.props.editHabit(habitId, editHabitName);
        this.closeEditDialog();
        this.openEditSnackbar();
      })
      .catch(err => this.setState({ errors: err.response.data.errObj }))
  }

  deleteHabit = e => {
    e.preventDefault();
    const token = jwtDecode(localStorage.jwtToken);
    if (token.exp < Date.now() / 1000) return this.props.logoutUser(this.props.history, true);
    const { habitId } = this.state;
    axios.delete(`/habits/${habitId}`)
      .then(res => {
        this.props.deleteHabit(habitId);
        this.closeDeleteDialog();
        this.openDeleteSnackbar();
      })
      .catch(err => console.log(err));
  }

  render() {
    const { classes } = this.props;
    const { errors } = this.state;

    const habitList = this.props.habits.habits.map((habit, index) => (
      <EditHabitItem
        key={habit._id}
        name={habit.name}
        streak={habit.streak}
        clicked={(e) => this.openMenu(e, habit._id, habit.name)} />
    ));

    return (
      <>
        <Navbar navValue={1} />
        <main className={classes.main}>
          <div className={classes.addBtnContainer}>
            <Button
              color="secondary"
              variant="contained"
              disableFocusRipple
              size="medium"
              onClick={this.openAddDialog}
            >
              <Add /> Add habit</Button>
          </div>
          <Dialog
            open={this.state.addDialogOpen}
            onClose={this.closeAddDialog}
          >
            <DialogTitle>Habit creation</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Enter a habit name below. Make sure that it's specific, it'll help you stay consistent!
              </DialogContentText>
              <form onSubmit={this.addNewHabit}>
                <input type="submit" style={{ visibility: 'hidden' }} />
                <TextField
                  onChange={this.inputChangedHandler}
                  value={this.state.name}
                  autoFocus
                  type="text"
                  label="Habit name"
                  name="name"
                  fullWidth
                  error={errors.name ? true : false}
                  helperText={errors.name ? errors.name : null}
                />
              </form>
            </DialogContent>
            <DialogActions>
              <Button
                color="secondary"
                variant="contained"
                size="medium"
                onClick={this.addNewHabit}
              >
                Add
              </Button>
            </DialogActions>
          </Dialog>
          <ul className={classes.list}>
            {this.props.habits.loading ?
              <div className={classes.loadingWrapper}>
                <CircularProgress style={{ width: 60, height: 60 }} />
              </div>
              : habitList}
            <Menu
              open={this.state.isMenuOpen}
              anchorEl={this.state.anchorEl}
              onBackdropClick={this.closeMenu}
            >
              <MenuItem onClick={this.openEditDialog}>Edit</MenuItem>
              <MenuItem onClick={this.openDeleteDialog}>Delete</MenuItem>
            </Menu>
          </ul>
          <Dialog
            open={this.state.editDialogOpen}
            onClose={this.closeEditDialog}
          >
            <DialogTitle>Edit habit</DialogTitle>
            <DialogContent>
              <form onSubmit={this.editHabit}>
                <input type="submit" style={{ visibility: 'hidden' }} />
                <TextField
                  onChange={this.inputChangedHandler}
                  value={this.state.editHabitName}
                  autoFocus
                  type="text"
                  label="Habit name"
                  name="editHabitName"
                  fullWidth
                  error={errors.editHabitName ? true : false}
                  helperText={errors.editHabitName ? errors.editHabitName : null}
                />
              </form>
            </DialogContent>
            <DialogActions>
              <Button
                color="secondary"
                variant="contained"
                size="medium"
                onClick={this.editHabit}
              >
                Edit
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.deleteDialogOpen}
            onClose={this.closeDeleteDialog}
          >
            <DialogTitle>{this.state.editHabitName ? this.state.editHabitName : <span>&nbsp;</span>}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to delete this habit? You will lose any existing streak!
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                className={classes.danger}
                variant="contained"
                size="medium"
                onClick={this.deleteHabit}
              >
                Delete
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            ContentProps={{
              classes: {
                root: classes.errorSnackbar
              }
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            open={this.state.errorSnackbarOpen}
            autoHideDuration={5000}
            onClose={this.closeErrorSnackbar}
            message="Maximum of 10 habits are allowed"
          />
          <Snackbar
            ContentProps={{
              classes: {
                root: classes.addSnackbar
              }
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            open={this.state.addSnackbarOpen || this.state.editSnackbarOpen}
            autoHideDuration={5000}
            onClose={this.closeAddAndEditSnackbar}
            message={this.state.addSnackbarOpen ? "Habit successfully added!" : this.state.editSnackbarOpen ? "Habit successfully edited!" : null}
          />
          <Snackbar
            ContentProps={{
              classes: {
                root: classes.danger
              }
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            open={this.state.deleteSnackbarOpen}
            autoHideDuration={5000}
            onClose={this.closeDeleteSnackbar}
            message="Habit successfully deleted!"
          />
        </main>
      </>
    )
  }
}

const mapStateToProps = state => ({
  habits: state.habit
});

export default connect(mapStateToProps, { setHabits, logoutUser, addHabit, deleteHabit, editHabit })(withRouter(withStyles(styles)(Manage)));