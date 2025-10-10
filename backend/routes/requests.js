const express = require("express");
const { fontFamily } = require("html2canvas/dist/types/css/property-descriptors/font-family");
const { ModelSource } = require("mapbox-gl");
const { platform } = require("os");
const { monitorEventLoopDelay } = require("perf_hooks");
const { DefaultDeserializer } = require("v8");
const router = express.Router();

router.post("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    // Ajouter ici la logique pour traiter la demande interne
    res.json({ message: "Demande interne envoyée" });
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
monitorEventLoopDelay
jhdkmi8
DefaultDeserializer"dev siteage ss 
console.error message is the ModelSource NodeJS 
res

fontFamily-platform