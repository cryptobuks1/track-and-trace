import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import { Snackbar, IconButton, SnackbarContent } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import { resetUserMessage } from "../../actions/user-message.actions";
import classNames from 'classnames';
import green from '@material-ui/core/colors/green';
class SnackbarMessage extends Component {
  constructor(props) {
    super(props)
    this.state = {
      snackClass: ''
    }
  }

  handleClose = () => {
    this.props.resetUserMessage();
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      snackClass: this.props.messageStatus !== nextProps.messageStatus ? 'success' : 'error'
    })
  }

  render() {
    const { userMessage, classes, className, messageStatus, isOpen } = this.props;
    const Icon = messageStatus ? CheckCircleIcon : ErrorIcon;
    const snackBarContentClass = classNames(classes[this.state.snackClass], className);

    return (
      <Snackbar
        open={isOpen}
        autoHideDuration={3000}
        onClose={this.handleClose}
      >
        <SnackbarContent
          className={snackBarContentClass}
          aria-describedby="client-snackbar"
          message={
            <span id="client-snackbar" className={classes.message}>
              <Icon className={classNames(classes.icon, classes.iconVariant)} />
              {userMessage}
            </span>
          }
          action={[
            <IconButton
              key="close"
              aria-label="Close"
              color="inherit"
              className={classes.close}
              onClick={this.handleClose}
            >
              <CloseIcon className={classes.icon} />
            </IconButton>,
          ]}

        />
      </Snackbar>
    )
  }
}

const styles = theme => ({
  // any local styling classes would go here
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing.unit,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  }
});

const mapStateToProps = (state) => {
  return {
    authentication: state.authentication,
    userMessage: state.userMessage.message,
    messageStatus: state.userMessage.success,
    isOpen: state.userMessage.isOpen,
  };
};

const connected = connect(mapStateToProps, {
  resetUserMessage
})(
  withStyles(styles)(SnackbarMessage)
);

export default withRouter(connected);
