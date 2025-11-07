import React, { Component } from 'react';
import { connect } from 'react-redux';

class UserManage extends Component {


    constructor(props) {
        super(props);
        this.state = {

        };
    }


    // state = {
    //     users: [], // để chứa danh sách user
    // };

    // async componentDidMount() {
    //     try {
    //         const res = await fetch("http://localhost:5001/api/read_user?id_user=ALL");
    //         const data = await res.json();
    //         console.log(">>> check users:", data);

    //         this.setState({ users: data });
    //     } catch (error) {
    //         console.error("Error fetching users:", error);
    //     }
    // }

    render() {
        return (
            <div className="users-container">
                <div className="title">User Management</div>
            </div>
        );
    }
}

export default connect()(UserManage);
