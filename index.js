const express = require('express')
const fs = require('fs')
const path = require('path');
const app = express()
const port = process.env.PORT || 5000;
require("dotenv").config();
//this line is required to parse the request body
app.use(express.json())
app.use(express.static("public"))
const getRandomIndex = length => {
    const randomNumber = Math.floor(Math.random() * length);
    return randomNumber;
}
/* Create - POST method */
app.post('/user/save', (req, res) => {
    //get the existing user data
    const existUsers = getUserData()
    
    //get the new user data from post request
    const userData = req.body

    //check if the userData fields are missing
    if (userData.id == null || userData.gender == null || userData.contact == null || userData.address == null
        || userData.photoUrl == null
        
        ) {
        return res.status(401).send({error: true, msg: 'User data missing'})
    }
    
    //check if the username exist already
    const findExist = existUsers.find( user => user.id === userData.id )
    if (findExist) {
        return res.status(409).send({error: true, msg: 'userID already exist'})
    }

    //append the user data
    existUsers.push(userData)

    //save the new user data
    saveUserData(existUsers);
    res.send({success: true, msg: 'User data added successfully'})

})

/* Read - GET method */
app.get('/user/all', (req, res) => {
    try{
    const users = getUserData()
    const data = JSON.parse(fs.readFileSync('users.json', "utf-8"));
    res.status(200).json(data)
    }
    catch(error){
        res.status(400).send(error)
    }
})
app.get('/user/random', (req, res) => {
  
    const existUsers = getUserData()
    console.log(existUsers)
    var len=Object.keys(existUsers).length
    console.log("length",len)
    const id = getRandomIndex(len)+1;
    console.log("id",id)

    console.log(existUsers)
    const findExist = existUsers.find( user => user.id ==id )
    console.log(findExist)
    res.json(findExist)
})

/* Update - Patch method */
app.patch('/user/update/:id', (req, res) => {
    try {
        if ( req.params.id== null
            ) {
            return res.status(401).send({error: true, msg: 'User ID missing'})
        }
           
    
    const id = req.params.id

    //get the update data
    const userData = req.body
console.log(userData)
   
    const existUsers = getUserData()

  
    const findExist = existUsers.find( user => user.id === id )
    if (!findExist) {
        return res.status(409).send({error: true, msg: 'id not exist'})
    }

    //filter the userdata
    const updateUser = existUsers.filter( user => user.id !== id )

    //push the updated data
    updateUser.push(userData)

    //finally save it
    saveUserData(updateUser)

    res.send({success: true, msg: 'User data updated successfully'})
}
    catch (error) {
        
    }
})
app.patch('/user/bulk-update', (req, res) => {
    try{
    //get the username from url
    
    //get the update data
    const userData = req.body
console.log(userData)
    //get the existing user data
    const existUsers = getUserData()
console.log(existUsers)
if (!Array.isArray(userData)) return res.status(500).send({
    message: {
        success: false,
        message: "Please send an array of objects with these key-values, id and update(an object with the updated values)"
    }
});


   // check if the username exist or not       
    const findExist = existUsers.filter( o1 =>userData.some (o2=>o1.id===o2.id))
    console.log("findExist",findExist)
    if (findExist.length===0) {
        return res.status(409).send({error: true, msg: 'user not exist'})
    }
    const updateUser=existUsers.filter( o1 =>userData.some (o2=>o1.id!==o2.id))
    console.log("not exist",updateUser,"exitst",findExist)
   
    const result = existUsers.map(({id, gender,contact,address,photoUrl}) => ({
        id:userData.some(user => user.id === id)?userData.find(user => 
            user.id === id).id:id,
        contact:userData.some(user => user.id === id)?userData.find(user => 
             user.id === id).contact:contact,
             gender,
        address,
        photoUrl
      }))
console.log("results", result)
    updateUser.push(result)

 
   console.log("updated user",updateUser);
   const newData = updateUser.flat();
  



 
 
 
console.log(newData)
    saveUserData(result)
    res.send({success: result, msg: 'User data updated successfully'})


 }
catch(error){
    console.log(error)
    res.status(400).send(error)
}
})

/* Delete - Delete method */
app.delete('/user/delete/:id', (req, res) => {
    if ( req.params.id== null
        ) {
        return res.status(401).send({error: true, msg: 'User ID missing'})
    }
    const id = req.params.id

    //get the existing userdata
    const existUsers = getUserData()

    //filter the userdata to remove it
    const filterUser = existUsers.filter( user => user.id !== id )

    if ( existUsers.length === filterUser.length ) {
        return res.status(409).send({error: true, msg: 'username does not exist'})
    }

    //save the filtered data
    saveUserData(filterUser)

    res.send({success: true, msg: 'User removed successfully'})
    
})


/* util functions */

//read the user data from json file
const saveUserData = (data) => {
    const stringifyData = JSON.stringify(data)
    fs.writeFileSync('users.json', stringifyData)
}

//get the user data from json file
const getUserData = () => {
    // const file = path.join(process.cwd(), 'users.json');
    // const jsonData = fs.readFileSync(file, "utf-8");
    const jsonData = fs.readFileSync('users.json','utf-8')
    return JSON.parse(jsonData)    
}

/* util functions ends */


//configure the server port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
app.get("/", (req, res) => res.status(200).send("hello user"));
