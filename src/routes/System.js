

import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import UserManage from '../pages/UserManage';

class System extends Component {
    render() {
        return (
            <div className="system-container">
                <div className="system-list">
                    <Switch>
                        <Route path="/system/user-manage" component={UserManage} />
                        <Redirect to="/system/user-manage" />
                    </Switch>
                </div>
            </div>
        );
    }
}

export default System;
