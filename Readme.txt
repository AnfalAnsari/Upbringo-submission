The API is made using nodejs and mysql

it has following endpoints

1. /api/store-shop-details  => it is a post request that stores stores shop details {name, address, contact number, email }

   the body should be a json of format 

   {
   
    "name": "example name",
    "address": "example address",
    "contact_no": "1234657980",
    "email": "exampleemain@gmail.com"
   
   }

2. /api/createTable => it is get request to create table for storing bill data (need to be executed only first time)

3. /api/addEntry => this is post request for adding entry to the bills 

   the body should of of this json format

   {
    "name": "customer1",
    "contact_no": "123456789",
    "items": {
    "values":[
      {
         "name":"Oranges",
         "quantity":2,
         "rate":5,
         "discount":0.5,
         "GST":0.5,
         "total":0
      },
      {
         "name":"Apples",
         "quantity":2,
         "rate":5,
         "discount":0.5,
         "GST":0.5,
         "total":0
      }
    ]
    },
   "total": 0

}

Note:
items is a json array we can have multiple items
bill number is stored in database and is auto incremented
by default bill is added as unpaid

4. /api/markPaid/:bill_no => this is put request to update the bill with provided bill_no. as paid 

5. /api/markUnPaid/:bill_no => this is put request to update the bill with provided bill_no. as unpaid



