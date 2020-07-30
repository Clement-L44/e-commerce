"use strict";

var express = require('express');
var fs = require('fs');
const https = require('https');

var MongoClient = require("mongodb").MongoClient;
var assert = require("assert");
var cors = require("cors");
const url = "mongodb://localhost:27017/";

let ObjectId = require("mongodb").ObjectId;

var app = express();

https.createServer(options, app).listen(8443);

const options = {
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt'),
    ca: fs.readFileSync('./ca.crt'),
    requestCert: true,
    rejectUnauthorized: false
};

app.use(cors()); //Permettre le cross-origin resource sharing

function productResearch (db, param, callback) {
    db.collection("Products").find(param["filterObject"]).toArray((err,documents) => {
        if(err) callback (err, []);
        if (documents !== undefined) callback(param["message"], documents);
        else callback(param["message"], []);
    })

};

function distinctValuesResearch (db, selectors, property, callback) {
    db.collection("Products").distinct(property, (err, documents) => {
        if (err){
            selectors.push({"name": property, "values": []});
        }
        else {
            if(documents !== undefined) {
                let values = [];
                if(property == 'price'){
                    let min = Math.min.apply(null, documents);
                    let max = Math.max.apply(null, documents);
                    let minSlice = Math.floor(min / 100)*100;
                    let maxSlice = minSlice + 99;
                    values.push(minSlice+" - "+maxSlice);
                    while (max > maxSlice) {
                        minSlice += 100;
                        maxSlice += 100;
                        values.push(minSlice+" - "+maxSlice);
                    }
                    selectors.push({'name': property, 'values' : values});
                }
                else {
                    selectors.push({'name' : property, 'values' : documents.sort()});
                }
                
            }
            else {
                selectors.push({'name' : property, 'values' : []});
            }
        }
        callback(selectors);
    });
};  

MongoClient.connect(url, {useNewUrlParser: true}, (err, client) => {

    let db = client.db('OnlineSales');
    assert.equal(null, err);

    app.get("/auth/login=:login/password=:password", function (req,res) {
        let login = req.params.login;
        let password = req.params.password;
        res.setHeader("Content-type", "text/plain; charset=UTF-8");
        db.collection("Users").find({'email':login, "password":password}).toArray((err,doc) => {
            if(doc !== undefined && doc.length == 1) {
                res.end("1");
            }
            else {
                res.end("0");
            }
        });
    });

    app.get("/Products/:type/:brand/:minprice/:maxprice/:minpopularity", (req,res) => {
        let filterObject = {};
        //Si la valeur n'est pas égal à l'astérique cela signifie que la critère de recherche n'est pas pris en compte, elle devient la valeur de la propriété filterObject.
        if(req.params.type != "*"){

            filterObject.type = req.params.type;
        }
        if(req.params.brand != "*"){

            filterObject.brand = req.params.brand;
        }
        if (req.params.minprice != "*" || req.params.maxprice != "*"){
            filterObject.price = {};

            if (req.params.minprice != "*"){

                filterObject.price.$gte = parseInt(req.params.minprice);
            }
            if(req.params.maxprice !="*"){

                filterObject.price.$lte = parseInt(req.params.maxprice);
            }
                
        }

        if(req.params.minpopularity !="*"){
            filterObject.popularity = {};
            filterObject.popularity.$gte = parseInt(req.params.minpopularity);
        }

        productResearch(db, {'message' : '/Products', "filterObject" : filterObject},
        (etape, results) => {
            console.log(etape+" avec "+results.length+" produits sélectionnés :");
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader("Content-type", "application/json; charset=UTF-8");
            var json=JSON.stringify(results);
            console.log(json);
            res.end(json);
        });
            
    });

    app.get("/Products/id=:id", (req,res) => {
        let ObjectId = require("mongodb").ObjectId;
        let id = req.params.id;
        if(req.params.id !="*"){
            db.collection("Products").find({"_id": ObjectId(id)}).toArray((err, documents) => {
            let json=JSON.stringify({});
            if (documents !== undefined && documents[0] !== undefined){
                json = JSON.stringify(documents[0]);
                console.log(json);
                res.end(json);
            }
            else res.end(json);
            
            });
        }
    });

    app.get("/Products/selectors", (req,res) => {
        distinctValuesResearch(db, [], "type", (selectors) => {
            distinctValuesResearch(db, selectors, "brand", (selectors) => {
                distinctValuesResearch(db, selectors, "price", (selectors) => {
                    distinctValuesResearch(db, selectors, "popularity", (selectors) => {
                        let json = JSON.stringify(selectors);
                        res.setHeader("Content-type", "application/json; charset = UTF-8");
                        res.end(json);
                    });
                });
            });
        });
    
    });

    app.get("/Products/keywords", (req,res) => {
        let keywords = [];
        for (let keyword in req.query){
            keywords.push(keyword);
        }
        db.collection("Products").find({}, {"_id" : 0}).toArray((err, documents) => {
            let results = [];
            documents.forEach((product) => {
                let match = true;
                for (let k of keywords) {
                    let found = false;
                    for(let p in product) {
                        let regexp = new RegExp(k, "i");
                        if (regexp.test(product[p])){
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        match = false;
                    }
                    if (match) {
                        results.push(product);
                    } 
                }
            });
            res.setHeader("Content-type", "application/json; charset=UTF-8");
            let json = JSON.stringify(results);
            res.end(json);
        });
    });

    app.get("/Product/id:=id", (req,res) => {
        let id = req.params.id;
        let json = JSON.stringify({});
        if (/[0-9a-f]{24}/.test(id)){
            db.collection("Products").find({"_id": ObjectId(id)}).toArray((err, documents)=> {
                if ( documents !== undefined && documents[0] !== undefined){
                    json = JSON.stringify(documents[0]);
                }
            });
        }
        res.end(json);
    });

    app.get("/CartProducts/productIds/email=:email", (req,res) => {
        let email = req.params.email;
        db.collection("Carts").find({'email':email}).toArray((err, documents) => {
            if( documents !== undefined && documents[0] !== undefined) {
                let order = documents[0].order;
                res.setHeader("Content-type", "application/json; charset=UTF-8");
                let json = JSON.stringify(order);
                res.end(json);
            }
        });
    });

    app.get("/CartProducts/products/email=:email", (req,res) => {
        let email = req.params.email;
        let pipeline = [
            { $match: {"email": email}},
            { $unwind: "$order"},
            { $lookup: { from: "Products", localField: "order", foreignField: "_id", as: "product"}},
            { $unwind: "$product"},
            { $group: {"_id": "$_id", "order": {"$push": "$order"}, "products": {"$push": "$product"}}}
        ];

        db.collection("Carts").aggregate(pipeline).toArray((err, documents) => {
            let json;
            if( documents !== undefined && documents[0] !== undefined){
                let productsInE = documents[0].products;
                let productsInI = {};
                for (let product of productsInE) {
                    if(product._id in productsInI) {
                        productsInI[product._id].nb++;
                    }
                    else {
                        productsInI[product._id] = {"_id": product._id, "type": product.type, "brand": product.brand, "name": product.name, "popularity": product.popularity, "price": product.price, "nb":1};
                    }
                    let productList = [];
                    for (let productId in productsInI){
                        productList.push(productsInI[productId]);
                    }
                    json = JSON.stringify(productList);
                }
            }
            else {
                json = JSON.stringify([]);
            }
            res.setHeader("Content-type", "application/json; charset=UTF-8");
            res.end(json);
        });
    });


    app.post("/CartProducts", (req,res) => {
        let email = req.body.email;
        let productId = req.body.productId;

        db.collection('Carts').find({'email':email}).toArray((err, documents)=> {
            let json;
            if (documents !== undefined && documents[0] !== undefined){
                let order = documents[0].order;
                order.push(ObjectId(productId));
                db.collection("Carts").update({'email':email}, {$set: {"order":order}});
                json = JSON.stringify(order);
            }
            else {
                json = JSON.stringify([]);
            }
            res.setHeader("Content-type", "application/json; charset=UTF-8");
            res.end(json);
        })
    });

    app.delete("/CartProducts/productsId=:productId/email=:email", (req,res) => {
        let email = req.params.email;
        let productId = req.params.productId;

        db.collection("Carts").find({"email":email}).toArray((err, documents) => {
            let json = [];
            if(documents !== undefined && documents[0] !== undefined) {
                let order = documents[0].order;
                let position = order.map(function(e) {
                    return e.toString();
                }).indexOf(productId);
                if(position != -1) {
                    order.splice(position, 1);
                    db.collection("Carts").update({"email":email}, {$set: {"order":order}});
                    json = order;
                }
            }
            res.setHeader("Content-type", "application/json; charset=UTF-8");
            res.end(JSON.stringify(json));
        });
    });

    app.get('/Cart/reset/email=:email'), (req,res)=> {
        let email = req.params.email;
        db.collection("Carts").update({'email':email}, {$set: {order: []}});
        res.setHeader("Content-type", "application/json; charset=UTF-8");
        res.end("Cart reset done");
    }

});

app.listen(8888);
