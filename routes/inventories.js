const express = require("express");
const { body, validationResult } = require("express-validator");
const router = express.Router();
const knex = require("knex")(require("../knexfile").development);

router.get("/inventories", (req, res) => {
  knex
    .select("inventories.*", "warehouses.warehouse_name")
    .from("inventories")
    .join("warehouses", "inventories.warehouse_id", "warehouses.id")
    .then((data) => {
      if (data.length === 0) {
        return res
          .status(404)
          .json({ message: "No data found for this warehouse" });
      }
      res.status(200).json(data);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.get("/inventories/:id", (req, res) => {
  const { id } = req.params;
  knex
    .select("inventories.*", "warehouses.warehouse_name")
    .from("inventories")
    .join("warehouses", "inventories.warehouse_id", "warehouses.id")
    .where("inventories.id", id)
    .then((data) => {
      if (data.length === 0) {
        return res
          .status(404)
          .json({ message: "Unable to retrieve item with id " + id });
      }
      res.status(200).json(data);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    });
});

router.post("/inventories", (req, res) => {
  if (!req.body) {
    return res.status(404).json({ message: "Please fill all fields" });
  }
  knex("inventories")
    .insert(req.body)
    .then((createdInventory) => {
      res
        .status(201)
        .json({ message: "Added new Inventory of id " + createdInventory });
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Unable to add new item to Inventory" });
    });
});

router.put("/inventories/:id", (req, res) => {
  knex("inventories")
    .where({ id: req.params.id })
    .update(req.body)
    .then(() => {
      return res.status(200).json({ message: "Inventory Updated!" });
    });
});

router.delete("/inventories/:id", (req, res) => {
  const { id } = req.params;

  knex("inventories")
    .where({ id })
    .del()
    .then((deletedInventory) => {
      if (deletedInventory === 0) {
        return res.status(404).json({ message: "Inventory ID not found" });
      }
      res.sendStatus(204);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    });
});
module.exports = router;
