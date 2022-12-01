const express = require("express");
const mysql = require("mysql");
const Joi = require("joi");
const app = express();
app.use(express.json());

port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("listening on" + port);
});

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "mydatabase",
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connecte to MySQL server");
});

app.get("/api/createDatabase", (req, res) => {
  let sql = "CREATE DATABASE mydatabase";
  db.query(sql, (err, result) => {
    if (err) {
      throw err;
    }
    res.send(result);
  });
});

app.post("/api/store-shop-details", (req, res) => {
  const result = validateShopDetails(req.body);

  if (result.error) {
    res.send(result.error.details[0].message);
    throw result.error.details[0].message;
  }

  let values = [
    [req.body.name, req.body.address, req.body.contact_no, req.body.email],
  ];

  let sql =
    "INSERT INTO `shop_details` (`name`, `address`, `contact_no`, `email`) VALUES (?);";

  db.query(sql, values, (err, result) => {
    if (err) {
      throw err;
    }

    res.send(result);
  });
});

app.get("/api/createTables", (req, res) => {
  let sql =
    "CREATE TABLE `mydatabase`.`bills` ( `buyer_name` VARCHAR(255) NOT NULL , `contact_no` VARCHAR(255) NOT NULL , `date_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP , `items` JSON NOT NULL , `total` FLOAT NOT NULL , `bill_no` INT NOT NULL AUTO_INCREMENT , PRIMARY KEY (`bill_no`), `paid` BOOLEAN NOT NULL DEFAULT FALSE) ENGINE = MyISAM;";

  db.query(sql, (err, result) => {
    if (err) {
      res.send(err.message);
      throw err;
    }
  });

  sql =
    "CREATE TABLE `mydatabase`. `shop_details` ( `name` VARCHAR(255) NOT NULL , `address` VARCHAR(255) NOT NULL , `contact_no` VARCHAR(255) NOT NULL , `email` VARCHAR(255) NOT NULL ) ENGINE = MyISAM;";

  db.query(sql, (err, result) => {
    if (err) {
      res.send(err.message);
      throw err;
    }
  });

  res.send("tables created successfully");
});

app.post("/api/addEntry", (req, res) => {
  let sql3 =
    "INSERT INTO `bills` (`buyer_name`, `contact_no`, `items`, `total`, `bill_no`, `date_time`) VALUES (?,null,current_timestamp())";

  const result = validateBill(req.body);

  if (result.error) {
    res.send(result.error.details[0].message);
    throw result.error.details[0].message;
  }

  req.body.items.values.forEach((item) => {
    const result = validateItem(item);
    if (result.error) {
      res.send(
        result.error.details[0].message +
          "in Item " +
          (req.body.items.values.indexOf(item) + 1)
      );
      throw result.error.details[0].message;
    }
    item.total = item.quantity * item.rate;
    item.total = item.total - (item.total * item.discount) / 100;
    item.total = item.total + (item.total * item.GST) / 100;
    req.body.total += item.total;
  });

  let values = [
    [
      req.body.name,
      req.body.contact_no,
      JSON.stringify(req.body.items),
      req.body.total,
    ],
  ];

  db.query(sql3, values, (err, result) => {
    if (err) {
      throw err;
    }

    res.send(result);
  });
});

app.put("/api/markPaid/:bill_no", (req, res) => {
  let sql_update = `UPDATE bills SET paid = 1 WHERE bill_no = ${parseInt(
    req.params.bill_no
  )}`;

  db.query(sql_update, (err, result, field) => {
    if (err) {
      throw err;
    }

    let sql_find =
      "SELECT * FROM `bills` WHERE bill_no =" + parseInt(req.params.bill_no);
    db.query(sql_find, (err, result, field) => {
      if (err) {
        throw err;
      }

      if (result.length === 0) {
        res.status(400).send("No bill with given id exists");
      }
      res.send(result);
    });
  });
});
app.put("/api/markUnPaid/:bill_no", (req, res) => {
  let sql_update = `UPDATE bills SET paid = 0 WHERE bill_no = ${req.params.bill_no}`;

  db.query(sql_update, (err, result, field) => {
    if (err) {
      throw err;
    }

    let sql_find = "SELECT * FROM `bills` WHERE bill_no =" + req.params.bill_no;
    db.query(sql_find, (err, result, field) => {
      if (err) {
        throw err;
      }

      if (result.length === 0) {
        res.status(400).send("No bill with given id exists");
      }
      res.send(result);
    });
  });
});

function validateShopDetails(details) {
  const schema = Joi.object({
    name: Joi.string().required(),
    contact_no: Joi.string().required(),
    address: Joi.string().required(),
    email: Joi.string().required(),
  });

  const result = schema.validate(details);

  return result;
}

function validateItem(item) {
  const schema = Joi.object({
    name: Joi.string().required(),
    quantity: Joi.number().integer().required(),
    rate: Joi.number().required(),
    GST: Joi.number().required(),
    discount: Joi.number().required(),
    total: Joi.number().required(),
  });

  const result = schema.validate(item);

  return result;
}
function validateBill(body) {
  const schema = Joi.object({
    name: Joi.string().required(),
    contact_no: Joi.string().required(),
    items: Joi.any().required(),
    total: Joi.number().required(),
  });

  const result = schema.validate(body);

  return result;
}
