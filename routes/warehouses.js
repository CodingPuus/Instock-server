//warehouses.js
const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const knex = require("knex")(require("../knexfile").development);

router.get("/warehouses", (req, res) => {
  knex
    .select("*")
    .from("warehouses")
    .then((warehouses) => res.status(200).json(warehouses))
    .catch((error) => res.status(500).json({ error: "Database error" }));
});

router.get(
  "/warehouses/:id",

  (req, res) => {
    const { id } = req.params;
    knex("warehouses")
      .where({ id })
      .then((warehouses) => {
        if (warehouses.length) {
          res.status(200).json(warehouses[0]);
        } else {
          res.status(404).json({ error: "Warehouse not found" });
        }
      })
      .catch((error) => res.status(500).json({ error: "Database error" }));
  }
);
router.get("/warehouses/:id/inventories", (req, res) => {
  const { id } = req.params;

  knex("inventories")
    .where("warehouse_id", id)
    .then((inventories) => {
      if (inventories.length > 0) {
        res.status(200).json(inventories);
      } else {
        res.status(404).json({ error: "No inventories found for the warehouse ID" });
      }
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ error: "Internal server error" });
    });
});


router.post(
  "/warehouses",
  [
    body("warehouse_name").notEmpty(),
    body("address").notEmpty(),
    body("city").notEmpty(),
    body("country").notEmpty(),
    body("contact_name").notEmpty(),
    body("contact_position").notEmpty(),
    body("contact_phone")
      .notEmpty()
      .isMobilePhone(undefined, { strictMode: true }),
    body("contact_email").notEmpty().isEmail(),
  ],
  (req, res) => {
    if (!req.body.contact_phone || !req.body.contact_email) {
      return res.status(400).json({ message: "Please input correct data" });
    }

    knex("warehouses")
      .insert(req.body)
      .then((createdWarehouse) => {
        res
          .status(201)
          .json({ message: "Added warehouse of id " + createdWarehouse });
      })
      .catch((error) => {
        console.error(error);
        res.status(500).json({ message: "Unable to add new warehouse" });
      });
  }
);

router.delete("/warehouses/:id", (req, res) => {
  const { id } = req.params;

  knex("warehouses")
    .where({ id })
    .del()
    .then((deletedWarehouse) => {
      if (deletedWarehouse === 0) {
        return res.status(404).json({ message: "Warehouse ID not found" });
      }
      res.sendStatus(204);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.put('/warehouses/:id', [
  body('warehouse_name').notEmpty(),
  body('address').notEmpty(),
  body('city').notEmpty(),
  body('country').notEmpty(),
  body('contact_name').notEmpty(),
  body('contact_position').notEmpty(),
  body('contact_phone').notEmpty().isMobilePhone(),
  body('contact_email').notEmpty().isEmail(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const {
    warehouse_name,
    address,
    city,
    country,
    contact_name,
    contact_position,
    contact_phone,
    contact_email
  } = req.body;

  try {
    const updatedWarehouse = await knex('warehouses')
      .where({ id })
      .update({
        warehouse_name,
        address,
        city,
        country,
        contact_name,
        contact_position,
        contact_phone,
        contact_email
      })
      .returning('*');

    if (updatedWarehouse.length === 0) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }

    res.status(200).json(updatedWarehouse[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;