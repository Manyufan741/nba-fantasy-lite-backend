const express = require("express");
const router = new express.Router();

const AllApi = require("../scripts/getAll");

router.get("/", async function (req, res, next) {
    try {
        const everything = await AllApi.getEverything(req.query);
        return res.json({everything});
  } catch (err) {
    return next(err);
  }
});

module.exports = router;