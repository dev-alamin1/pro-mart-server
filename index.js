const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
var jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

// middleware 
app.use(cors());
app.use(express.json());


// mongo db 
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSOWRD}@cluster0.mttjtbw.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run()
{
    try{

     /*
    |-----------------------------------
    |  Database Collections 
    |---------------------------------
    */
    
    const usersCollection= client.db('promart').collection('users')
    const productsCollection= client.db('promart').collection('products')
    const categoriesCollection= client.db('promart').collection('categories')
    const bookingsCollection = client.db('promart').collection('bookings')

        
    /*
    |-----------------------------------
    |  Store user info when register or signup
    |---------------------------------
    */

    app.post('/addUser', async(req, res) =>{
        const user = req.body;
        console.log(user);
        const result = await usersCollection.insertOne(user);
        res.send(result);
    })

     /*
    |-----------------------------------
    |  Get all buyers ( user)
    |---------------------------------
    */

    app.get('/buyers',async(req,res)=>{
        const query = {
            role:'buyer'
        }

        const allbuyer = await usersCollection.find(query).toArray();
        return res.send(allbuyer)
    });


    /*
    |-----------------------------------
    |  Jwt token when user register or login
    |---------------------------------
    */

    app.get('/jwt',async(req,res)=>{
        const email = req.query.email;
        const query = {
            email:email
        }
        const user = await usersCollection.findOne(query)

        if(user)
        {
            const token = jwt.sign({email},process.env.ACCESS_TOKEN,{expiresIn:'2h'});
            return res.send({accessToken:token})
        }

        return res.send({accessToken:''});
    });

     /*
    |-----------------------------------
    |  Fetch Product info from database 
    |---------------------------------
    */

    // get all categories information
    app.get('/categoires',async(req,res)=>{
        const query = {};
        const categories = await categoriesCollection.find(query).toArray();
        return res.send(categories)
    })

    // get a single category name by category id
    app.get('/categoryinfo',async(req,res)=>{
        const id = req.query.id;
        const query = {_id:ObjectId(id)}
        const category = await categoriesCollection.findOne(query);
        return res.send(category)
    })

    // get a single product by category id 
    app.get('/category/:id',async(req,res)=>{
        const id = req.params.id;
        const query ={category_id:id};
        const products = await productsCollection.find(query).toArray();
        return res.send(products);
    })

     /*
    |-----------------------------------
    |  Product Booking Implementation
    |---------------------------------
    */

    //store booked product
    app.post('/store/booking/product',async(req,res)=>{
        const productInfo = req.body;
        productInfo.date = new Date();
        const result = await bookingsCollection.insertOne(productInfo);
        console.log(result)
        return res.send(result);

    });

    //get orders by user email 
    app.get('/orders',async(req,res)=>{
        const email = req.query.email;
        const query = {
            email : email
        }

        const orders = await bookingsCollection.find(query).toArray();
        return res.send(orders);
    })

    }
    finally{

    }
}
run().catch((error)=>console.log(error));

app.get('/',(req,res)=>{
    res.send("Pro mart server is running ...");
});

app.listen(port,()=>{
    console.log("Pro mart server is running on port ",port)
})