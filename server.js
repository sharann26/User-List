const hapi = require('hapi');
const joi = require('joi');
const mongoose = require('mongoose');
const username = 'admin';
const password = 'a123';
const dbname = 'db';

/* Config server port and settings */
const server = new hapi.server({
    host: 'localhost',
    port: 3000,
    routes: {
        cors: {
            origin: ['*']
        }
    }
});

/* Connect mongodb */
mongoose.connect(`mongodb+srv://${username}:${password}@cluster0.sfwvb.mongodb.net/${dbname}?retryWrites=true&w=majority`);

// (First name, Last name, Gender, Email, Mob no, Area of interest( C++, .Net, Java, Nodejs), Password, Confirm Password)
/* Create model using mongodb */
const UserListModel = mongoose.model('user-list', {
    first_name: String,
    last_name: String,
    gender: String,
    email: String,
    mobile_no: String,
    area_of_interest: String,
    password: String
});

/* API for Signup */
server.route({
    method: 'POST',
    path: '/api/v1/signup',
    handler: registerUser,
    options: {
        description: 'api to register the user to the application'
    }
});

/* API to get all user  */
server.route({
    method: 'GET',
    path: '/api/v1/get_user_list/{id?}',
    handler: getUser,
    options: {
        description: 'api to get the particular/whole user details'
    }
});

/* API for Sample */
server.route({
    method: 'GET',
    path: '/api/v1/admin-credentials',
    handler: getAdminCredentials,
    options: {
        description: 'api to get the admin credentials'
    }
});

/* API for Login */
server.route({
    method: 'POST',
    path: '/auth/v1/login',
    handler: loginUser,
    options: {
        description: 'api to login the user into application'
    }
});

async function loginUser(request, h) {
    try {
        var result = {
            status: 0,
            data: [],
            message: 'Default response for login'
        };
        var payload = request.payload;
        var user = await UserListModel.find().exec();
        user = user.filter(value => {
            return (value.email == payload.email);
        });
        if (user.length) {
            user = user.filter(value => {
                return (value.password == payload.pwd);
            });
            if(user.length) {
                result = {
                    status: 0,
                    data: user[0],
                    message: 'Login Success !!'
                }
            } else {
                result = {
                    status: -1,
                    data: user[0],
                    message: 'Password incorrect'
                }
            }
        } else {
            result = {
                status: 1,
                data: [],
                message: 'No user found !!'
            }
        }


        return h.response(result);
    } catch (error) {
        return h.response(error).code(500);
    }
}

async function getUser(request, h) {
    try {
        var result = {
            status: 0,
            data: [],
            message: 'Default response for get user'
        };
        var id = request.query.id;
        result.data = await UserListModel.find().exec();
        if (id) {
            result.data = (result.data).filter(value => {
                return (value.email == id);
            });
        }
        return h.response(result);
    } catch (error) {
        return h.response(error).code(500);
    }
}

async function registerUser(request, h) {
    try {
        var result = {
            status: 0,
            data: [],
            message: 'Default response for signup'
        }
        var email = request.payload.email;
        var user = await UserListModel.find().exec();
        user = user.filter(value => {
            return (value.email == email);
        });
        if (user.length) {
            result = {
                status: 1,
                data: user[0],
                message: 'Already registered !!'
            }
        } else {
            user = new UserListModel(request.payload);
            result.data = await user.save();
            result.message = 'Successfully registered !!';
        }
        return h.response(result);
    } catch (error) {
        return h.response(error).code(500);
    }
}


server.start();

console.log(`Server running on ${server.info.uri}`);

async function getAdminCredentials(req, h) {
    var result = {
        status: 0,
        data: {
            username: username,
            password: password
        },
        meassge: 'Success'
    };
    return h.response(result);
}


/* const server = new hapi.server({
    host: 'localhost',
    port: 3000,
    routes: {
        cors: {
            origin: ['*']
        }
    }
});

const init = async () => {
    server.route(routes);
    await server.start();
}

init(); */