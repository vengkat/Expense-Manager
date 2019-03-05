'use strict';
const functions = require('firebase-functions');
var firebase = require("firebase");
const admin = require("firebase-admin");
const path = require('path');
const {dialogflow,  
    BasicCard,
    BrowseCarousel,
    BrowseCarouselItem,
    Button,
    Carousel,
    Image,
    LinkOutSuggestion,
    List,
    MediaObject,
    Suggestions,
    SimpleResponse,
    Table} = require('actions-on-google');

    const serviceAccount = require(path.join(__dirname+"/expense-tracker-133df-firebase-adminsdk-lyrct-4c831393ff.json"));

    var config = {
        projectId:"expense-tracker-133df",
        apiKey: "AIzaSyDWOLeMJCm-GhRolGxxcfmW1Wn4ekTURuc",
        authDomain: "expense-tracker-133df.firebaseapp.com",
        databaseURL: "https://expense-tracker-133df.firebaseio.com",
        storageBucket: "gs://expense-tracker-133df.appspot.com",
        credential: admin.credential.cert(serviceAccount)
    };

firebase.initializeApp(config);
const db = firebase.firestore();

const ExpenceMasterColl = db.collection('Expense-Master');

const app = dialogflow({debug: true});

app.intent('Default Welcome Intent', (conv) => {
    conv.ask("How can I help you?");
});


app.intent('Get Expense Quantity', (conv,params) => {
    //const user = request.body.originalDetectIntentRequest.payload.user;
    const user      = {"lastSeen":"2019-02-17T09:12:55Z","locale":"en-US","userId":"ABwppHHguBKxBQCkxt4lyC7-YlDkQRJ3r0ITp1hcPKocfWkyHy6y62sY-Kec4PJsfbc9H3bkw0swcPknxFV402fuPoVC"};
    const userId    = user.userId;
    var result = 0;
    console.log(`Get Expense Quantity :: calling GetExpenseQuantity!`);
    var dateParam   = "";
	var categoryValue    = "";
    var date        = "";
    let list = [];
    var query   = ExpenceMasterColl;
    query       = query.where("UserId", "==", userId);
    
	if(params.date){
        dateParam       = params.date;
        var dateTime    = (dateParam).substr(0,(dateParam).indexOf("T"));
		dateTime        = new Date(dateTime);
        date            = (dateTime.getMonth()+1)+'/'+dateTime.getDate()+'/'+dateTime.getFullYear();
        
        if(date){   
            console.log(`GetExpenseQuantity:: date received- ${date} | date - ${date}`);      
            query = query.where("Date", "==", date);
        }
	}
	if(params.categoryValue){
        console.log(`GetExpenseQuantity:: params.categoryValue received- ${params.categoryValue}`);
        categoryValue    = params.categoryValue;
        query       = query.where("CategoryValue", "==", categoryValue);
	}

    return query.get()
    .then(snapshot => {                              
        snapshot.forEach(doc => {
            let data = doc.data();
            data.Id=doc.id;
            //console.log(`GetExpese :: data.CategoryValue ${data.CategoryValue} `);
            list.push(data);                                 
        }); 
        if(list.length > 0)    {
            list.forEach(function(item){
                console.log(`GetExpese :: list.forEach ${item.CategoryValue} `);
                result = result + parseInt(item.Amount);
            });
        }   
        conv.ask(`You have spent ${result} rupees`);
        return Promise.resolve('Read complete');
    }).catch(() => {
        conv.ask('Error reading entry from the Firestore database.');
    });
});


app.intent('Get Expense Report', (conv,params) => {
    //const user = request.body.originalDetectIntentRequest.payload.user;
    const user      = {"lastSeen":"2019-02-17T09:12:55Z","locale":"en-US","userId":"ABwppHHguBKxBQCkxt4lyC7-YlDkQRJ3r0ITp1hcPKocfWkyHy6y62sY-Kec4PJsfbc9H3bkw0swcPknxFV402fuPoVC"};
    const userId    = user.userId;
    var dateParam   = "";
	var category    = "";
    var date        = "";

    var query   = ExpenceMasterColl;
    query       = query.where("UserId", "==", userId);
    
	if(params.date){
        dateParam       = params.date;
        var dateTime    = (dateParam).substr(0,(dateParam).indexOf("T"));
		dateTime        = new Date(dateTime);
        date            = (dateTime.getMonth()+1)+'/'+dateTime.getDate()+'/'+dateTime.getFullYear();
        console.log(`GetExpenseQuantity:: params.date - ${params.date} | date - ${date}`);
        if(date){         
            query = query.where("Date", "==", date);
        }
	}
	if(params.category){
        category    = params.category;
        query       = query.where("CategoryValue", "==", category);
	}
	var result = 0;
    console.log("The Parameters are- date : "+date+" and category : "+category);
    
    let list = [];

    query.get()
    .then(snapshot => {                              
       snapshot.forEach(doc => {
          let data = doc.data();
          data.Id=doc.id;
          list.push(data);                                 
       });      
       var data = [];
       list.forEach(function(item){
           var row = new Array(CategoryValue,Amount,ActionDate);
           data.push(row);
           row = [];
       });            
       console.log(`Get Expense Report :: Table data - ${data}`);
       conv.ask('The below are the expense details.')
       conv.ask(new Table({
           dividers: true,
           columns: ['Category', 'Amount', 'Date Time'],
           rows: data
       }));       
       return true;                       
    })
    .catch(err => {
        console.log('GetExpese :: Error getting documents', err);
        conv.ask(`Internal server error.`);
        return false;
    });  
});

app.intent('Add Expense', (conv,params) => {
    console.log(`params.amount - ${params.amount}`);
    //var params = JSON.stringify(agent.parameters);
    var currency        = params.amount;
    var amount          = currency.amount;
    var currencyName    = currency.currency;
    var categoryName    = "";
    var categoryValue   = "";
    //const user = request.body.originalDetectIntentRequest.payload.user;
    const user      = {"lastSeen":"2019-02-17T09:12:55Z","locale":"en-US","userId":"ABwppHHguBKxBQCkxt4lyC7-YlDkQRJ3r0ITp1hcPKocfWkyHy6y62sY-Kec4PJsfbc9H3bkw0swcPknxFV402fuPoVC"};
    const userId    = user.userId;

    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            console.log(key + ": " + params[key]);
            if(key !== "amount" && params[key].length > 0){
                categoryName    = key;
                categoryValue   = params[key]
            }
        }
    }
    console.log(`Add Expense :: categoryName - ${categoryName} | categoryValue - ${categoryValue}`);
    var dateParam   = "";
    var date        = "";
    if(params.date){
        dateParam = params.date;
        var dateTime = (dateParam).substr(0,(dateParam).indexOf("T"));
        dateTime = new Date(dateTime);
        date = (dateTime.getMonth()+1)+'/'+dateTime.getDate()+'/'+dateTime.getFullYear();
    }

    if(!date || date.length === 0){
      var now = new Date(); 
      date = (now.getMonth()+1)+'/'+now.getDate()+'/'+now.getFullYear();
    }
    conv.ask(`Your expense added successfully!`); 
    return new Promise(function(resolve) {
        ExpenceMasterColl.doc().set({
            CategoryName:  categoryName,     
            CategoryValue: categoryValue, 
            Amount:amount,
            ActionDate: new Date(),
            Date:date,
            UserId : userId
        }).then(ref => {              
            console.log('AddExpense :: document added successfully');          
            resolve(true);
            return;
        }).catch(err => {
            console.log('AddExpense :: Error adding documents', err);
            conv.ask(`Internal server error.`);
            resolve(true);
        });
    });    
});
exports.ExpenseManagerAction = functions.https.onRequest(app);

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
