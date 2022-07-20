
const AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-east-1'
});

const bcrypt = require('bcryptjs')
const util = require('../utils/util')
const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'zymr-users';

async function register(userInfo) {
    const name = userInfo.name;
    const email = userInfo.email;
    const username = userInfo.username;
    const password = userInfo.password;

    if (!username || !name || !email || !password) {
        return util.buildResponse(401, {
            message: "All the fields are required"
        })
    }

    const dynamoUser = await getUser(username);
    if(dynamoUser && dynamoUser.username) {
        return util.buildResponse(401, {
            message: 'Username already Exists! Choose different one'
        });
    }

    const encryptedPW = bcrypt.hashSync(password.trim(), 10);
    const user = {
        name,
        email,
        username: username.toLowerCase().trim(),
        password: encryptedPW
    }

    const saveUserResponse = await saveUser(user);
    if(!saveUserResponse) {
        return util.buildResponse(503, {
            message: "Server Error ! Please try again later"
        });        
    }
    return util.buildResponse(200, { username: username})

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

async function saveUser(user) {
    const params = {
        TableName: userTable,
        Item: user
    }
    return await dynamodb.put(params).promise().then( response => {
          return true;  
        }, error => {
            console.error("There is an Error while Save: ", error);
        });
}


module.exports.register = register











