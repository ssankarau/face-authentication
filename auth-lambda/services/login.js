const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});

const bcrypt = require('bcryptjs')
const util = require('../utils/util')
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'zymr-users';
const auth = require('../utils/auth');

async function login(user) {
    const username = user.username;
    const password = user.password;
    if(!user || !username || !password) {
        return util.buildResponse(401, {
            message: "username and password are requried"
        })
    }
    const dynamoUser = await getUser(username.toLowerCase().trim())
    if(!dynamoUser || !dynamoUser.username ) {
        return util.buildResponse(403, { message: "User does not exists"})
    } 
    if(!bcrypt.compareSync(password, dynamoUser.password)){
        return util.buildResponse(403, { message: 'password is incorrect'});
    }

    const userInfo = {
        username: dynamoUser.username,
        name: dynamoUser.name
    }
    const token = auth.generateToken(userInfo)
    const response = {
        user: userInfo,
        token: token
    }

    return util.buildResponse(200, response)
}

async function getUser(username) {
    const params = {
        TableName: userTable,
        Key: {
            username
        }
    }
    return await dynamodb.get(params).promise().then( response => {
          return response.Item;  
        }, error => {
            console.error("There is an Error while retrive: ", error);
        })
}




module.exports.login = login;
