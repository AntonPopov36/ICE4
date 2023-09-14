//imports
const mongoose = require('mongoose')
const express = require('express') 
const bcrypt = require('bcrypt')

//local imports
const User = require('./models/users')

//declarations
const port = 7000;
const app = express()
const connstring = 'mongodb+srv://antonp:owtY4mbRmqSuL5JQ@cluster0.xnaj48i.mongodb.net/'

//operations

//start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

//connect to mongo
mongoose.connect(connstring, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() =>{
        console.log('connection established succesfully')
    })
        .catch(error => {
            console.error('connection to MongoDB has failed', error)
        })

app.use(express.json())

//create secure account
const saltRound = 10;
app.post('/register', async (req, res) => {
    bcrypt.hash(req.body.password, saltRound)
        .then(hash => {
            const user = new User({
                username: req.body.username,
                password: hash
            })
        user.save()
            .then(result => {
                res.status(201).json({message: 'New user created.', result: result})
            })
            .catch(error => {
                res.status(500).jason({error: 'Failed to create user.'})
            })
        })
        .catch(err => {
            res.status(500).json({error: 'Failed to hash password.'})        
        })
})

//login by comparing hashes
app.post('/login', (req, res) => {
    const { username, password } = req.body
    User.findOne({ username })
        .then(user => {
            if(!user){
                return res.status(401).json({error: 'User does not exist.'})
            }
            bcrypt.compare(password, user.password)
                .then(match => {
                    if(match){
                        res.status(200).json({message: 'Welcome '+username})   

                    } else{
                        res.status(401).json({message: 'Authentication failed.'})   
                    }
                })
                .catch(err => {
                    res.status(500).json({error: 'Please check if you password or username are correct.'})
                })
        .catch(err => {
            res.status(500).json({error: 'User does not exist.'})
        })
    })  
})